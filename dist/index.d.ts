export interface HLSMakerConfig {
    sourceFilePath: string;
    hlsStartTime?: string;
    hlsDuration?: string;
    hlsManifestPath?: string;
    hlsSegmentDuration?: number;
    hlsListSize?: number;
    appendMode: boolean;
    endlessMode: boolean;
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
    constructor(options: HLSMakerConfig);
    conversion(callback?: (progress: any) => void): Promise<void>;
    prepareFFmpegOptions(): void;
    /**
     * Chỗ này có thể dùng ffprobe để trích xuất cho chính xác
     */
    private _setMediaInfo;
    private _getDefaultManifestPath;
    static timeMarkToMs(timeString: string): number;
    static msToTimeMark(milliseconds: number): string;
}
