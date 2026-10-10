import { IsEnum } from 'class-validator';
import { IssueStatus } from '../../common/issue-status.enum.js';

export class UpdateIssueStatusDto {
  @IsEnum(IssueStatus)
  status: IssueStatus;
}
