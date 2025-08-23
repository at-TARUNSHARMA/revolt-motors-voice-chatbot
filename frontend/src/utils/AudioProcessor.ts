export default class AudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private isRecording: boolean = false;
  private onAudioData: ((audioData: string) => void) | null = null;

  constructor() {
    // Initialize audio context
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended (required by Chrome)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio context initialization failed');
    }
  }

  async startRecording(onAudioDataCallback: (audioData: string) => void): Promise<void> {
    if (this.isRecording) {
      console.warn('Recording is already in progress');
      return;
    }

    try {
      this.onAudioData = onAudioDataCallback;

      // Get user media (microphone access)
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // Mono
          sampleRate: 16000, // 16kHz as required by Gemini
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      if (!this.audioContext) {
        await this.initializeAudioContext();
      }

      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }

      // Create audio source from stream
      this.source = this.audioContext.createMediaStreamSource(this.stream);

      // Create script processor for audio data processing
      // Buffer size of 4096 provides good balance between latency and processing
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording) return;

        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);

        // Convert Float32Array to Int16Array (16-bit PCM)
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Clamp the value to [-1, 1] and convert to 16-bit
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          int16Data[i] = Math.floor(sample * 32767);
        }

        // Convert to base64 for transmission
        const buffer = new ArrayBuffer(int16Data.length * 2);
        const view = new DataView(buffer);
        for (let i = 0; i < int16Data.length; i++) {
          view.setInt16(i * 2, int16Data[i], true); // Little endian
        }

        const base64Audio = this.arrayBufferToBase64(buffer);
        
        if (this.onAudioData && base64Audio) {
          this.onAudioData(base64Audio);
        }
      };

      // Connect audio nodes
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);

      this.isRecording = true;
      console.log('Audio recording started');

    } catch (error) {
      console.error('Failed to start recording:', error);
      this.stopRecording();
      
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error('Microphone access denied. Please allow microphone permissions and try again.');
      } else if (error instanceof Error && error.name === 'NotFoundError') {
        throw new Error('No microphone found. Please connect a microphone and try again.');
      } else {
        throw new Error('Failed to access microphone. Please check your audio settings.');
      }
    }
  }

  stopRecording(): void {
    if (!this.isRecording) {
      return;
    }

    try {
      this.isRecording = false;

      // Stop and clean up media stream
      if (this.stream) {
        this.stream.getTracks().forEach(track => {
          track.stop();
        });
        this.stream = null;
      }

      // Disconnect and clean up audio nodes
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }

      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }

      this.onAudioData = null;
      console.log('Audio recording stopped');

    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    try {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error('Error converting audio to base64:', error);
      return '';
    }
  }

  // Check if the browser supports the required APIs
  static isSupported(): boolean {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }

  // Get available audio input devices
  static async getAvailableDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'audioinput');
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }

  // Check current recording state
  get recording(): boolean {
    return this.isRecording;
  }

  // Clean up resources
  dispose(): void {
    this.stopRecording();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
