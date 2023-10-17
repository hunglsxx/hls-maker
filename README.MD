# HLSMaker

HLSMaker is a library that helps create HLS (HTTP Live Streaming) video segments from a source file. HLS is a protocol for distributing video over the internet.

## Installation

Install the library from npm:

```bash
npm install hls-maker
```

## Usage

```bash
import { HLSMaker, HLSMakerConfig } from 'hls-maker';

const options: HLSMakerConfig = {
    sourceFilePath: 'path/to/source/video.mp4',
    // Other options as per your requirements
};

const hlsMaker = new HLSMaker(options);

// Start the conversion process
hlsMaker.conversion(progress => {
    console.log(`Progress: ${progress.percent}%`);
}).then(() => {
    console.log('Conversion completed');
}).catch(error => {
    console.error('Error:', error);
});
```

## Options

### HLSMakerConfig
- ```sourceFilePath```: Path to the source file (required).
- ```hlsStartTime```: Start time for segmenting in HLS.
- ```hlsDuration```: Duration of the segment for HLS.
- ```hlsManifestPath```: Path to the HLS manifest file after segmenting.
- ```hlsSegmentDuration```: Duration of each segment (in seconds).
- ```hlsListSize```: Manifest list size.
- ```appendMode```: Append mode for segments.
- ```endlessMode```: Endless mode (no termination).

## Support

Contact the author: hunglsxx@gmail.com

## License
This library is released under the MIT License.

