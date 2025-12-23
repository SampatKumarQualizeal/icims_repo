import { JobRecord } from "./ats.job.shapes";
import { CandidateRecord } from "./ats.candidate.shapes";
import { ListResponse } from "./shared.common.shapes";

export type JobSearchResponse = ListResponse<JobRecord>;
export type CandidateSearchResponse = ListResponse<CandidateRecord>;
