import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EditableField } from '../common/editable-field.enum.js';
import { Edit, Extraction } from './extraction-result.interface.js';

// Instructions for the model. Field names must match EditableField exactly.
const SYSTEM_PROMPT = `You read messages from people selling a used electric car.
Find EVERY car detail they want to correct or add. One message can contain several.

Allowed fields:
- "mileage": kilometers driven, number only
- "batteryHealth": battery state of health in percent, number 0-100
- "equipments": ONE item (e.g. "winter tires", "tow bar"). Several items = several edits.
  If the car does NOT have an item (seller wants it removed), put a minus sign first: "-tow bar".
  Any name the seller says the car has or lacks is an item, even if it is short or unknown to you
  (e.g. "abs", "winter tires", "tow bar"). Copy the name exactly. Never turn an item name into a mileage.

Reply ONLY with JSON: {"edits": [{"field": "<field>", "value": "<value>"}]}
If nothing matches these fields, reply {"edits": []}

Examples:
"oh I forgot, it has winter tires" -> {"edits": [{"field": "equipments", "value": "winter tires"}]}
"the mileage was exactly 5005km, and it has winter tires" -> {"edits": [{"field": "mileage", "value": "5005"}, {"field": "equipments", "value": "winter tires"}]}
"battery is at 87% not 80, also has a tow bar and a heat pump" -> {"edits": [{"field": "batteryHealth", "value": "87"}, {"field": "equipments", "value": "tow bar"}, {"field": "equipments", "value": "heat pump"}]}
"actually there is no tow bar, I removed it" -> {"edits": [{"field": "equipments", "value": "-tow bar"}]}
"it doesn't have the heat pump but it has winter tires" -> {"edits": [{"field": "equipments", "value": "-heat pump"}, {"field": "equipments", "value": "winter tires"}]}
"we have k2 and we don't have a sunroof, battery is 91" -> {"edits": [{"field": "equipments", "value": "k2"}, {"field": "equipments", "value": "-sunroof"}, {"field": "batteryHealth", "value": "91"}]}
"when do I get paid?" -> {"edits": []}`;

const TIMEOUT_MS = 20_000;

// VIN = 17 characters, letters I, O and Q are never used
// (?=...\d) = must contain a digit, so a 17-letter word like "electromechanical" isn't a VIN
const VIN_REGEX = /\b(?=[A-HJ-NPR-Z0-9]*\d)[A-HJ-NPR-Z0-9]{17}\b/i;

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  constructor(private readonly config: ConfigService) {}

  // Finds a VIN with a regex (more reliable than a model for 17 exact chars)
  findVin(message: string): string | null {
    return message.match(VIN_REGEX)?.[0].toUpperCase() ?? null;
  }

  // Seller text in -> { vin, edits: [...] } out. Returns null if nothing usable was found.
  // It never throws, so the caller only has to handle "null".
  async extract(message: string): Promise<Extraction | null> {
    try {
      const vin = this.findVin(message);
      // Remove the VIN before asking the model, so its digits aren't mistaken for mileage
      const text = vin ? message.replace(VIN_REGEX, '').trim() : message;

      const raw = await this.askModel(text);
      this.logger.debug(`Model said: ${JSON.stringify(raw)}`);

      const edits = this.validate(raw);
      return edits.length ? { vin, edits } : null;
    } catch (err) {
      this.logger.warn(`Extraction failed: ${(err as Error).message}`);
      return null;
    }
  }

  private async askModel(message: string): Promise<unknown> {
    const baseUrl = this.config.get<string>('LLM_BASE_URL');
    const model = this.config.get<string>('LLM_MODEL');
    const apiKey = this.config.get<string>('LLM_API_KEY') ?? '';

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      throw new Error(`LLM returned ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }

  // Never trust the model: keep only valid edits, drop the rest.
  private validate(raw: unknown): Edit[] {
    if (typeof raw !== 'object' || raw === null) return [];
    const list = (raw as { edits?: unknown }).edits;
    if (!Array.isArray(list)) return [];

    const result: Edit[] = [];
    for (const item of list) {
      const edit = this.validateOne(item);
      if (!edit) continue;

      if (edit.field === EditableField.Equipments) {
        // several equipment items are fine, but each item only once
        // ("tow bar" and "-tow bar" are the same item: the last one wins)
        const index = result.findIndex(
          (e) =>
            e.field === EditableField.Equipments &&
            equipmentName(e.value) === equipmentName(edit.value),
        );
        if (index >= 0) result[index] = edit;
        else result.push(edit);
      } else {
        // mileage / batteryHealth: only one value makes sense, the last one wins
        const index = result.findIndex((e) => e.field === edit.field);
        if (index >= 0) result[index] = edit;
        else result.push(edit);
      }
    }
    return result;
  }

  private validateOne(raw: unknown): Edit | null {
    if (typeof raw !== 'object' || raw === null) return null;
    const { field, value } = raw as { field?: unknown; value?: unknown };

    // 1. field must be one of our editable columns
    if (!Object.values(EditableField).includes(field as EditableField)) return null;

    // 2. value must exist
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (!text) return null;

    // 3. per-field rules
    switch (field as EditableField) {
      case EditableField.Mileage: {
        const digits = text.replace(/km|kilometers?|[.,\s]/gi, '');
        if (!/^\d+$/.test(digits)) return null;
        return { field: EditableField.Mileage, value: digits };
      }
      case EditableField.BatteryHealth: {
        const num = Number(text.replace(/%|\s/g, ''));
        if (!Number.isInteger(num) || num < 0 || num > 100) return null;
        return { field: EditableField.BatteryHealth, value: String(num) };
      }
      case EditableField.Equipments: {
        // "- tow bar" -> "-tow bar" (minus = remove), "tow bar" -> add
        const remove = text.startsWith('-');
        const name = text.replace(/^-+\s*/, '').slice(0, 200);
        if (!name) return null;
        return { field: EditableField.Equipments, value: remove ? `-${name}` : name };
      }
    }
  }
}

// Item name without the minus sign, lowercase, for comparing
export function equipmentName(value: string): string {
  return value.replace(/^-+\s*/, '').trim().toLowerCase();
}
