"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HLSMaker = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const mime_1 = __importDefault(require("mime"));
class HLSMaker {
    constructor(options) {
        if (!fs_1.default.existsSync(options.sourceFilePath)) {
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
    async conversion(callback) {
        let that = this;
        let lastProgress;
        await new Promise((resolve, reject) => {
            (0, fluent_ffmpeg_1.default)(that.sourceFilePath)
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
                progress = Object.assign(Object.assign({}, progress), { input: that.sourceFilePath, output: that.hlsManifestPath });
                lastProgress = progress;
                if (callback) {
                    callback(progress);
                }
                else {
                    // console.log(progress);
                }
            })
                .on('end', () => {
                resolve({ input: that.sourceFilePath, output: that.hlsManifestPath });
            })
                .run();
        });
    }
    static async concat(options, callback) {
        let concatdHls = new HLSMaker({
            sourceFilePath: options.sourceFilePath,
            hlsManifestPath: options.hlsManifestPath,
            appendMode: true,
            endlessMode: !options.isLast
        });
        if (callback) {
            concatdHls.conversion(callback);
        }
        else {
            await concatdHls.conversion();
        }
    }
    prepareFFmpegOptions() {
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
            let flags = [];
            if (this.appendMode)
                flags = flags.concat(['append_list', 'discont_start']);
            if (this.endlessMode)
                flags = flags.concat(['omit_endlist']);
            if (flags.length) {
                this._ffmpegOutputOptions = this._ffmpegOutputOptions.concat([
                    '-hls_flags', flags.join('+')
                ]);
            }
        }
        catch (error) {
            throw error;
        }
    }
    static timeMarkToMs(timeString) {
        try {
            const timeParts = timeString.split(':');
            const hours = parseInt(timeParts[0], 10) || 0;
            const minutes = parseInt(timeParts[1], 10) || 0;
            const seconds = parseFloat(timeParts[2]) || 0;
            const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
            return totalMs;
        }
        catch (error) {
            throw error;
        }
    }
    static msToTimeMark(milliseconds) {
        try {
            let totalSeconds = milliseconds / 1000;
            const hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = (totalSeconds % 60).toFixed(2);
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.padStart(5, '0')}`;
            return timeString;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Chỗ này có thể dùng ffprobe để trích xuất cho chính xác
     */
    _setMediaInfo() {
        try {
            this.sourceMimeType = mime_1.default.getType(this.sourceFilePath) || '';
            this.sourceExtension = mime_1.default.getExtension(this.sourceMimeType) || '';
            fluent_ffmpeg_1.default.ffprobe(this.sourceFilePath, (error, metadata) => {
                var _a;
                if (error)
                    throw error;
                this.sourceDuration = (((_a = metadata === null || metadata === void 0 ? void 0 : metadata.format) === null || _a === void 0 ? void 0 : _a.duration) || 0) * 1000;
            });
        }
        catch (error) {
            throw error;
        }
    }
    _getDefaultManifestPath() {
        const pathObject = path_1.default.parse(this.sourceFilePath);
        return path_1.default.join(pathObject.dir, `${pathObject.name}.m3u8`);
    }
}
exports.HLSMaker = HLSMaker;
