import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EditableField } from '../common/editable-field.enum.js';
import { Extraction } from './extraction-result.interface.js';

// Instructions for the model. Field names must match EditableField exactly.
const SYSTEM_PROMPT = `You read messages from people selling a used electric car.
Find the ONE car detail they want to correct or add.

Allowed fields:
- "mileage": kilometers driven, number only
- "batteryHealth": battery state of health in percent, number 0-100
- "equipments": an extra item the car has (e.g. "winter tires", "tow bar")

Reply ONLY with JSON: {"field": "<field>", "value": "<value>"}
If the message is not about one of these fields, reply {"field": null, "value": null}

Examples:
"oh I forgot, it has winter tires" -> {"field": "equipments", "value": "winter tires"}
"sorry the km is actually 41.000" -> {"field": "mileage", "value": "41000"}
"battery is at 87% not 80" -> {"field": "batteryHealth", "value": "87"}
"when do I get paid?" -> {"field": null, "value": null}`;

const TIMEOUT_MS = 20_000;

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);

  constructor(private readonly config: ConfigService) {}

  async extract(message: string): Promise<Extraction | null> {
    try {
      const raw = await this.askModel(message);
      this.logger.debug(`Model said: ${JSON.stringify(raw)}`);
      return this.validate(raw);
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

  private validate(raw: unknown): Extraction | null {
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
      case EditableField.Equipments:
        return { field: EditableField.Equipments, value: text.slice(0, 200) };
    }
  }
}
