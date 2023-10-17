import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import mime from 'mime';

export interface HLSMakerConfig {
    sourceFilePath: string;          // Path to the source file

    hlsStartTime?: string;           // Start time for segmenting in HLS
    hlsDuration?: string;            // Duration of the segment for HLS

    hlsManifestPath?: string;        // Path to the HLS manifest file after segmenting
    hlsSegmentDuration?: number;     // Duration of each segment (in seconds)
    hlsListSize?: number;            // Manifest list size

    appendMode: boolean;             // Append mode for segments
    endlessMode: boolean;            // Endless mode (no termination)
}

export class HLSMaker {
    public sourceFilePath: string;
    public sourceMimeType: string | undefined;
    public sourceExtension: string | undefined;
    public sourceDuration: number | undefined;

    public hlsStartTime: string;
    public hlsDuration: string;
    public hlsManifestPath: string;
    public hlsSegmentDuration: number;
    public hlsListSize: number;

    public appendMode: boolean;
    public endlessMode: boolean;

    private _ffmpegOutputOptions: Array<string> | undefined;

    constructor(options: HLSMakerConfig) {
        if (!fs.existsSync(options.sourceFilePath)) {
            throw new Error(`Input path is not exist ${options.sourceFilePath}`);
        }
        this.sourceFilePath = options.sourceFilePath;
        this.hlsStartTime = options.hlsStartTime || '';
        this.hlsDuration = options.hlsDuration || '';
        this.hlsManifestPath = options.hlsManifestPath || this._getDefaultManifestPath();
        this.hlsSegmentDuration = options.hlsSegmentDuration || 2;
        this.appendMode = options.appendMode;
        this.endlessMode = options.endlessMode;
        this.hlsListSize = options.hlsListSize || 0;

        this._setMediaInfo();
        this.prepareFFmpegOptions();
    }

    public async conversion(callback?: (progress: any) => void): Promise<void> {
        let that = this;
        await new Promise<void>((resolve, reject) => {
            ffmpeg(that.sourceFilePath)
                .outputOptions(that._ffmpegOutputOptions || [])
                .output(that.hlsManifestPath)
                .on('error', (err, stdout, stderr) => {
                    console.error('Error:', err.message);
                    console.error('ffmpeg stdout:', stdout);
                    console.error('ffmpeg stderr:', stderr);
                    reject(err);
                })
                .on('start', (command) => {
                    console.log('ffmpeg command:', command);
                })
                .on('progress', (progress) => {
                    if (callback) {
                        callback(progress);
                    } else {
                        console.log("Conversion Processing", that.sourceFilePath, progress);
                    }
                })
                .on('end', () => {
                    console.log('Conversion Ended', that.sourceFilePath);
                    resolve();
                })
                .run();
        })
    }

    public prepareFFmpegOptions() {
        try {
            this._ffmpegOutputOptions = [];
            switch (this.sourceMimeType) {
                case 'video/mp4':
                    this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                        '-profile:v', 'baseline',
                        '-level', '3.0'
                    ]);
                    break;

                case 'video/quicktime':
                    this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                        '-c:v', 'copy',
                        '-c:a', 'aac',
                        '-b:a', '128k'
                    ]);
                    break;
                case 'video/x-matroska':
                    this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                        '-c:v', 'copy',
                        '-c:a', 'aac',
                        '-b:a', '128k'
                    ]);
                    break;

                default:
                    throw new Error(`Format ${this.sourceExtension} is not support`);
            }

            this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                '-r', '30',
                '-start_number', '0',
                '-hls_time', `${this.hlsSegmentDuration}`,
                '-hls_list_size', `${this.hlsListSize}`,
                '-f', 'hls'
            ]);

            if (this.hlsStartTime != '') {
                this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                    '-ss', this.hlsStartTime
                ]);
                if (this.hlsDuration != '') {
                    this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                        '-t', this.hlsDuration
                    ]);
                }
            }

            let flags: Array<string> = [];
            if (this.appendMode) flags = flags.concat(['append_list', 'discont_start']);
            if (this.endlessMode) flags = flags.concat(['omit_endlist']);

            if (flags.length) {
                this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                    '-hls_flags', flags.join('+')
                ]);
            }

        } catch (error) {
            throw error
        }
    }

    /**
     * Chỗ này có thể dùng ffprobe để trích xuất cho chính xác
     */
    private _setMediaInfo() {
        try {
            this.sourceMimeType = mime.getType(this.sourceFilePath) || '';
            this.sourceExtension = mime.getExtension(this.sourceMimeType) || '';

            ffmpeg.ffprobe(this.sourceFilePath, (error, metadata) => {
                if (error) throw error;

                this.sourceDuration = (metadata?.format?.duration || 0) * 1000;
            });

        } catch (error) {
            throw error;
        }
    }

    private _getDefaultManifestPath(): string {
        try {
            if (!this.sourceFilePath) return "";
            return `${path.join(path.dirname(this.sourceFilePath), path.basename(this.sourceFilePath))}.m3u8`;
        } catch (error) {
            throw error;
        }
    }

    public static timeMarkToMs(timeString: string): number {
        try {
            const timeParts = timeString.split(':');
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = parseFloat(timeParts[2]) || 0;

            const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

            return totalMs;
        } catch (error) {
            throw error;
        }
    }

    public static msToTimeMark(milliseconds: number): string {
        try {
            let totalSeconds = milliseconds / 1000;
            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = (totalSeconds % 60).toFixed(2);

            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}`;
            return timeString;
        } catch (error) {
            throw error;
        }
    }

}