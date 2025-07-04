import {Controller} from "@nestjs/common";
import {ResponseSampleDto, SamplesService} from "./samples.service";
import {TypedBody, TypedQuery, TypedRoute} from "@nestia/core";
import {CreateSampleDto} from "./dto/create-sample.dto";
import {SampleResponseInterface} from "../interceptors/sample-response.interface";

@Controller('samples')
export class SamplesController {
    constructor(private readonly samplesService: SamplesService) {
    }

    /**
     * Create a new sample
     *
     * @param createSampleDto Sample creation data
     * @returns ResponseSampleDto
     */
    @TypedRoute.Post()
    sample(
        @TypedBody() createSampleDto: CreateSampleDto
    ): ResponseSampleDto {
        return this.samplesService.sample(createSampleDto);
    }

    /**
     * Create a new sample
     *
     * @param createSampleDto Sample creation data
     * @returns ResponseSampleDto
     */
    @TypedRoute.Get('with-return-any')
    sampleWithReturnAny(
        @TypedQuery() createSampleDto: CreateSampleDto
    ): SampleResponseInterface<ResponseSampleDto> {
        return this.samplesService.sample(createSampleDto) as any;
    }

    @TypedRoute.Get('wrapped')
    sampleResultWrapping(
        @TypedQuery() createSampleDto: CreateSampleDto
    ): SampleResponseInterface<ResponseSampleDto> {
        return this.samplesService.sampleWrapped(createSampleDto) as any;
    }

}
