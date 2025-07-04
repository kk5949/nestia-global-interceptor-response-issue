import {Injectable} from '@nestjs/common';
import {CreateSampleDto} from './dto/create-sample.dto';
import {createSampleResponse, SampleResponseInterface} from "../interceptors/sample-response.interface";

export interface ResponseSampleDto{
    name: string;
    title: string;
    description: string;
    age: number;
}

@Injectable()
export class SamplesService {
    sample(createSampleDto: CreateSampleDto): ResponseSampleDto {
        return {
            name: createSampleDto.name,
            title: createSampleDto.title,
            description: createSampleDto.description,
            age: createSampleDto.age
        };
    }

    sampleWrapped(createSampleDto: CreateSampleDto): SampleResponseInterface<ResponseSampleDto> {
        const result = {
            name: createSampleDto.name,
            title: createSampleDto.title,
            description: createSampleDto.description,
            age: createSampleDto.age
        };

        return createSampleResponse(result, '', 200);
    }

}
