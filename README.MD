# HLSMaker

HLSMaker is a library that helps create HLS (HTTP Live Streaming) video segments from a source file. HLS is a protocol for distributing video over the internet.

## Installation

Install the library from npm:

```bash
npm install hls-maker
```

## Usage
### Using Promises
```javascript
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
### Using async/await
```javascript
import { HLSMaker, HLSMakerConfig } from 'hls-maker';

const options: HLSMakerConfig = {
    sourceFilePath: 'path/to/source/video.mp4',
    // Other options as per your requirements
};

async function convertVideo() {
    const hlsMaker = new HLSMaker(options);

    try {
        await hlsMaker.conversion();
        console.log('Conversion completed');
    } catch (error) {
        console.error('Error:', error);
    }
}

convertVideo();
```

## Concatenating HLS Streams
You can concatenate HLS streams using the concat method. This method combines multiple HLS streams into a single stream.
### Using callback function
```javascript
import { HLSMaker, ConcatConfig } from 'hls-maker';

const options: ConcatConfig = {
    sourceFilePath: 'path/to/first/video.mp4',
    hlsManifestPath: 'path/to/concatenated/output.m3u8',
    isLast: true // Set to true if this is the last stream in the sequence
};

HLSMaker.concat(options, function (process) {
    console.log("Processing", process);
});
```
### Using async/await
```javascript
import { HLSMaker, ConcatConfig } from 'hls-maker';

const options: ConcatConfig = {
    sourceFilePath: 'path/to/first/video.m3u8',
    hlsManifestPath: 'path/to/concatenated/output.m3u8',
    isLast: true // Set to true if this is the last stream in the sequence
};

async function concatVideos() {
    try {
        await HLSMaker.concat(options);
        console.log('Concatenation completed');
    } catch (error) {
        console.error('Error:', error);
    }
}

concatVideos();
```

## Options
### HLSMakerConfig
- ```sourceFilePath``` (required): Path to the source file.
- ```hlsStartTime```: Start time for segmenting in HLS.
- ```hlsDuration```: Duration of the segment for HLS.
- ```hlsManifestPath```: Path to the HLS manifest file after segmenting.
- ```hlsSegmentDuration```: Duration of each segment (in seconds).
- ```hlsListSize```: Manifest list size.
- ```appendMode``` (required): Append mode for segments.
- ```endlessMode``` (required): Endless mode (no termination).
### ConcatConfig
- ```sourceFilePath``` (required): Path to the source file of the first segment.
- ```hlsManifestPath``` (required): Path to the output manifest file after concatenation.
- ```isLast``` (required): Set to true if this is the last stream in the sequence.

## Support

Contact the author: hunglsxx@gmail.com

## License
This library is released under the MIT License.
