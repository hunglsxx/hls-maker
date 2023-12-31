export interface HLSMakerConfig {
    sourceFilePath: string;
    hlsStartTime?: string;
    hlsDuration?: string;
    hlsManifestPath?: string;
    hlsSegmentDuration?: number;
    hlsListSize?: number;
    appendMode: boolean;
    endlessMode: boolean;
    ffmpegInputOptions?: Array<string>;
    ffmpegOutputOptions?: Array<string>;
}
export interface ConcatConfig {
    hlsManifestPath: string;
    sourceFilePath: string;
    endlessMode: boolean;
    ffmpegInputOptions?: Array<string>;
    ffmpegOutputOptions?: Array<string>;
}
export interface InsertConfig {
    hlsManifestPath: string;
    sourceHlsManifestPath: string;
    spliceIndex?: number;
    splicePercent?: number;
    isLast?: boolean;
}
export declare class HLSMaker {
    sourceFilePath: string;
    sourceMimeType: string | undefined;
    sourceExtension: string | undefined;
    sourceDuration: number | undefined;
    hlsStartTime: string;
    hlsDuration: string;
    hlsManifestPath: string;
    hlsSegmentDuration: number;
    hlsListSize: number;
    appendMode: boolean;
    endlessMode: boolean;
    private _ffmpegOutputOptions;
    private _ffmpegInputOptions;
    constructor(options: HLSMakerConfig);
    conversion(callback?: (progress: any) => void): Promise<any>;
    static concat(options: ConcatConfig, callback?: (progress: any) => void): Promise<void>;
    static insert(options: InsertConfig): Promise<void>;
    prepareFFmpegOptions(): void;
    static timeMarkToMs(timeString: string): number;
    static msToTimeMark(milliseconds: number): string;
    /**
     * Chỗ này có thể dùng ffprobe để trích xuất cho chính xác
     */
    private _setMediaInfo;
    private _getDefaultManifestPath;
    private _isUrl;
}
