
# React Audio Components (JS & TSX)

---


## WEB Audio API:

## Introduction

Audio on the web has been fairly primitive up to this point and until very recently has had to be delivered through plugins such as Flash and QuickTime. The introduction of the `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` element in HTML5 is very important, allowing for basic streaming audio playback. But, it is not powerful enough to handle more complex audio applications. For sophisticated web-based games or interactive applications, another solution is required. It is a goal of this specification to include the capabilities found in modern game audio engines as well as some of the mixing, processing, and filtering tasks that are found in modern desktop audio production applications.

The APIs have been designed with a wide variety of use cases [\[webaudio-usecases\]](https://www.w3.org/TR/webaudio/#biblio-webaudio-usecases) in mind. Ideally, it should be able to support _any_ use case which could reasonably be implemented with an optimized C++ engine controlled via script and run in a browser. That said, modern desktop audio software can have very advanced capabilities, some of which would be difficult or impossible to build with this system. Apple’s Logic Audio is one such application which has support for external MIDI controllers, arbitrary plugin audio effects and synthesizers, highly optimized direct-to-disk audio file reading/writing, tightly integrated time-stretching, and so on. Nevertheless, the proposed system will be quite capable of supporting a large range of reasonably complex games and interactive applications, including musical ones. And it can be a very good complement to the more advanced graphics features offered by WebGL. The API has been designed so that more advanced capabilities can be added at a later time.

### Features

The API supports these primary features:

-   [Modular routing](https://www.w3.org/TR/webaudio/#ModularRouting) for simple or complex mixing/effect architectures.
    
-   High dynamic range, using 32-bit floats for internal processing.
    
-   [Sample-accurate scheduled sound playback](https://www.w3.org/TR/webaudio/#AudioParam) with low [latency](https://www.w3.org/TR/webaudio/#latency) for musical applications requiring a very high degree of rhythmic precision such as drum machines and sequencers. This also includes the possibility of [dynamic creation](https://www.w3.org/TR/webaudio/#DynamicLifetime) of effects.
    
-   Automation of audio parameters for envelopes, fade-ins / fade-outs, granular effects, filter sweeps, LFOs etc.
    
-   Flexible handling of channels in an audio stream, allowing them to be split and merged.
    
-   Processing of audio sources from an `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` or `[video](https://html.spec.whatwg.org/multipage/media.html#video)` `[media element](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`.
    
-   Processing live audio input using a `[MediaStream](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` from `[getUserMedia()](https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia)`.
    
-   Integration with WebRTC
    
    -   Processing audio received from a remote peer using a `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` and [\[webrtc\]](https://www.w3.org/TR/webaudio/#biblio-webrtc).
        
    -   Sending a generated or processed audio stream to a remote peer using a `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)` and [\[webrtc\]](https://www.w3.org/TR/webaudio/#biblio-webrtc).
        
-   Audio stream synthesis and processing [directly using scripts](https://www.w3.org/TR/webaudio/#AudioWorklet).
    
-   [Spatialized audio](https://www.w3.org/TR/webaudio/#Spatialization) supporting a wide range of 3D games and immersive environments:
    
    -   Panning models: equalpower, HRTF, pass-through
        
    -   Distance Attenuation
        
    -   Sound Cones
        
    -   Obstruction / Occlusion
        
    -   Source / Listener based
        
-   A convolution engine for a wide range of linear effects, especially very high-quality room effects. Here are some examples of possible effects:
    
    -   Small / large room
        
    -   Cathedral
        
    -   Concert hall
        
    -   Cave
        
    -   Tunnel
        
    -   Hallway
        
    -   Forest
        
    -   Amphitheater
        
    -   Sound of a distant room through a doorway
        
    -   Extreme filters
        
    -   Strange backwards effects
        
    -   Extreme comb filter effects
        
-   Dynamics compression for overall control and sweetening of the mix
    
-   Efficient [real-time time-domain and frequency-domain analysis / music visualizer support](https://www.w3.org/TR/webaudio/#AnalyserNode).
    
-   Efficient biquad filters for lowpass, highpass, and other common filters.
    
-   A Waveshaping effect for distortion and other non-linear effects
    
-   Oscillators
    

#### Modular Routing

Modular routing allows arbitrary connections between different `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` objects. Each node can have inputs and/or outputs. A source node has no inputs and a single output. A destination node has one input and no outputs. Other nodes such as filters can be placed between the source and destination nodes. The developer doesn’t have to worry about low-level stream format details when two objects are connected together; [the right thing just happens](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing). For example, if a mono audio stream is connected to a stereo input it should just mix to left and right channels [appropriately](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing).

In the simplest case, a single source can be routed directly to the output. All routing occurs within an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` containing a single `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)`:

![modular routing](https://www.w3.org/TR/webaudio/images/modular-routing1.png)

A simple example of modular routing.

Illustrating this simple routing, here’s a simple example playing a single sound:

[](https://www.w3.org/TR/webaudio/#example-05baec05)const context \= new AudioContext();

function playSound() {
  const source \= context.createBufferSource();
  source.buffer \= dogBarkingBuffer;
  source.connect(context.destination);
  source.start(0);
}

Here’s a more complex example with three sources and a convolution reverb send with a dynamics compressor at the final output stage:

![modular routing2](https://www.w3.org/TR/webaudio/images/modular-routing2.png)

A more complex example of modular routing.

[](https://www.w3.org/TR/webaudio/#example-86265d42)let context;let compressor;let reverb;let source1, source2, source3;let lowpassFilter;let waveShaper;let panner;let dry1, dry2, dry3;let wet1, wet2, wet3;let mainDry;let mainWet;function setupRoutingGraph () { context \= new AudioContext(); // Create the effects nodes. lowpassFilter \= context.createBiquadFilter(); waveShaper \= context.createWaveShaper(); panner \= context.createPanner(); compressor \= context.createDynamicsCompressor(); reverb \= context.createConvolver(); // Create main wet and dry. mainDry \= context.createGain(); mainWet \= context.createGain(); // Connect final compressor to final destination. compressor.connect(context.destination); // Connect main dry and wet to compressor. mainDry.connect(compressor); mainWet.connect(compressor); // Connect reverb to main wet. reverb.connect(mainWet); // Create a few sources. source1 \= context.createBufferSource(); source2 \= context.createBufferSource(); source3 \= context.createOscillator(); source1.buffer \= manTalkingBuffer; source2.buffer \= footstepsBuffer; source3.frequency.value \= 440; // Connect source1 dry1 \= context.createGain(); wet1 \= context.createGain(); source1.connect(lowpassFilter); lowpassFilter.connect(dry1); lowpassFilter.connect(wet1); dry1.connect(mainDry); wet1.connect(reverb); // Connect source2 dry2 \= context.createGain(); wet2 \= context.createGain(); source2.connect(waveShaper); waveShaper.connect(dry2); waveShaper.connect(wet2); dry2.connect(mainDry); wet2.connect(reverb); // Connect source3 dry3 \= context.createGain(); wet3 \= context.createGain(); source3.connect(panner); panner.connect(dry3); panner.connect(wet3); dry3.connect(mainDry); wet3.connect(reverb); // Start the sources now. source1.start(0); source2.start(0); source3.start(0);}

Modular routing also permits the output of `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s to be routed to an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` parameter that controls the behavior of a different `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`. In this scenario, the output of a node can act as a modulation signal rather than an input signal.

![modular routing3](https://www.w3.org/TR/webaudio/images/modular-routing3.png)

Modular routing illustrating one Oscillator modulating the frequency of another.

[](https://www.w3.org/TR/webaudio/#example-6d1537ab)function setupRoutingGraph() { const context \= new AudioContext(); // Create the low frequency oscillator that supplies the modulation signal const lfo \= context.createOscillator(); lfo.frequency.value \= 1.0; // Create the high frequency oscillator to be modulated const hfo \= context.createOscillator(); hfo.frequency.value \= 440.0; // Create a gain node whose gain determines the amplitude of the modulation signal const modulationGain \= context.createGain(); modulationGain.gain.value \= 50; // Configure the graph and start the oscillators lfo.connect(modulationGain); modulationGain.connect(hfo.detune); hfo.connect(context.destination); hfo.start(0); lfo.start(0);}

### API Overview

The interfaces defined are:

-   An [AudioContext](https://www.w3.org/TR/webaudio/#AudioContext) interface, which contains an audio signal graph representing connections between `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s.
    
-   An `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` interface, which represents audio sources, audio outputs, and intermediate processing modules. `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s can be dynamically connected together in a [modular fashion](https://www.w3.org/TR/webaudio/#ModularRouting). `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s exist in the context of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.
    
-   An `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for use with music visualizers, or other visualization applications.
    
-   An `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` interface, for working with memory-resident audio assets. These can represent one-shot sounds, or longer audio clips.
    
-   An `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which generates audio from an AudioBuffer.
    
-   An `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` subclass representing the final destination for all rendered audio.
    
-   An `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` interface, for controlling an individual aspect of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`'s functioning, such as volume.
    
-   An `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` interface, which works with a `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` for spatialization.
    
-   An `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)` interface representing a factory for creating custom nodes that can process audio directly using scripts.
    
-   An `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` interface, the context in which AudioWorkletProcessor processing scripts run.
    
-   An `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` representing a node processed in an AudioWorkletProcessor.
    
-   An `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` interface, representing a single node instance inside an audio worker.
    
-   A `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for common low-order filters such as:
    
    -   Low Pass
        
    -   High Pass
        
    -   Band Pass
        
    -   Low Shelf
        
    -   High Shelf
        
    -   Peaking
        
    -   Notch
        
    -   Allpass
        
-   A `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for combining channels from multiple audio streams into a single audio stream.
    
-   A `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for accessing the individual channels of an audio stream in the routing graph.
    
-   A `[ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for generating a nominally constant output value with an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` to allow automation of the value.
    
-   A `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for applying a real-time linear effect (such as the sound of a concert hall).
    
-   A `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which applies a dynamically adjustable variable delay.
    
-   A `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for dynamics compression.
    
-   A `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for explicit gain control.
    
-   An `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for a general IIR filter.
    
-   A `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio source from an `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)`, `[video](https://html.spec.whatwg.org/multipage/media.html#video)`, or other media element.
    
-   A `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio source from a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` such as live audio input, or from a remote peer.
    
-   A `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio source from a `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)`.
    
-   A `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio destination to a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` sent to a remote peer.
    
-   A `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for spatializing / positioning audio in 3D space.
    
-   A `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` interface for specifying custom periodic waveforms for use by the `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.
    
-   An `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for generating a periodic waveform.
    
-   A `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for equal-power positioning of audio input in a stereo stream.
    
-   A `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which applies a non-linear waveshaping effect for distortion and other more subtle warming effects.
    

There are also several features that have been deprecated from the Web Audio API but not yet removed, pending implementation experience of their replacements:

-   A `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for generating or processing audio directly using scripts.
    
-   An `[AudioProcessingEvent](https://www.w3.org/TR/webaudio/#audioprocessingevent)` interface, which is an event type used with `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` objects.
    

## 1\. The Audio API[](https://www.w3.org/TR/webaudio/#audioapi)

### 1.1. The `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` Interface[](https://www.w3.org/TR/webaudio/#BaseAudioContext)

[BaseAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext "The BaseAudioContext interface of the Web Audio API acts as a base definition for online and offline audio-processing graphs, as represented by AudioContext and OfflineAudioContext respectively. You wouldn't use BaseAudioContext directly — you'd use its features via one of these two inheriting interfaces.The BaseAudioContext interface of the Web Audio API acts as a base definition for online and offline audio-processing graphs, as represented by AudioContext and OfflineAudioContext respectively.")

Firefox53+SafariNoneChrome56+

___

Opera43+Edge79+

___

Edge (Legacy)NoneIENone

___

Firefox for Android53+iOS SafariNoneChrome for Android56+Android WebView56+Samsung Internet6.0+Opera Mobile43+

This interface represents a set of `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` objects and their connections. It allows for arbitrary routing of signals to an `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)`. Nodes are created from the context and are then [connected](https://www.w3.org/TR/webaudio/#ModularRouting) together.

`[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` is not instantiated directly, but is instead extended by the concrete interfaces `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` (for real-time rendering) and `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` (for offline rendering).

`[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` are created with an internal slot `[[pending promises]]` that is an initially empty ordered list of promises.

Each `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` has a unique [media element event task source](https://html.spec.whatwg.org/multipage/media.html#media-element-event-task-source). Additionally, a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` has two private slots `[[rendering thread state]]` and `[[control thread state]]` that take values from `[AudioContextState](https://www.w3.org/TR/webaudio/#enumdef-audiocontextstate)`, and that are both initialy set to `"suspended"`.

enum `AudioContextState` {
  ["suspended"](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-suspended),
  ["running"](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-running),
  ["closed"](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-closed)
};

Enumeration description

"`suspended`"

This context is currently suspended (context time is not proceeding, audio hardware may be powered down/released).

"`running`"

Audio is being processed.

"`closed`"

This context has been released, and can no longer be used to process audio. All system audio resources have been released.

callback [DecodeErrorCallback](https://www.w3.org/TR/webaudio/#callback-decodeerrorcallback-parameters) = [undefined](https://heycam.github.io/webidl/#idl-undefined) ([DOMException](https://heycam.github.io/webidl/#idl-DOMException) `error`);

callback [DecodeSuccessCallback](https://www.w3.org/TR/webaudio/#callback-decodesuccesscallback-parameters) = [undefined](https://heycam.github.io/webidl/#idl-undefined) ([AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) `decodedData`);

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `BaseAudioContext` : [EventTarget](https://dom.spec.whatwg.org/#eventtarget) {
  readonly attribute [AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode) [destination](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-destination);
  readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate);
  readonly attribute [double](https://heycam.github.io/webidl/#idl-double) [currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime);
  readonly attribute [AudioListener](https://www.w3.org/TR/webaudio/#audiolistener) [listener](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-listener);
  readonly attribute [AudioContextState](https://www.w3.org/TR/webaudio/#enumdef-audiocontextstate) [state](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-state);
  \[[SameObject](https://heycam.github.io/webidl/#SameObject), [SecureContext](https://heycam.github.io/webidl/#SecureContext)\]
  readonly attribute [AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet) [audioWorklet](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-audioworklet);
  attribute [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler) [onstatechange](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-onstatechange);

  [AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode) [createAnalyser](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createanalyser) ();
  [BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode) [createBiquadFilter](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbiquadfilter) ();
  [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [createBuffer](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer) ([unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `numberOfChannels`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer-numberofchannels-length-samplerate-numberofchannels),
                            [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `length`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer-numberofchannels-length-samplerate-length),
                            [float](https://heycam.github.io/webidl/#idl-float) `sampleRate`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer-numberofchannels-length-samplerate-samplerate));
  [AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode) [createBufferSource](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffersource) ();
  [ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode) [createChannelMerger](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelmerger) (optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfInputs](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelmerger-numberofinputs-numberofinputs) = 6);
  [ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode) [createChannelSplitter](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelsplitter) (
    optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelsplitter-numberofoutputs-numberofoutputs) = 6);
  [ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode) [createConstantSource](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createconstantsource) ();
  [ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode) [createConvolver](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createconvolver) ();
  [DelayNode](https://www.w3.org/TR/webaudio/#delaynode) [createDelay](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdelay) (optional [double](https://heycam.github.io/webidl/#idl-double) [maxDelayTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdelay-maxdelaytime-maxdelaytime) = 1.0);
  [DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode) [createDynamicsCompressor](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdynamicscompressor) ();
  [GainNode](https://www.w3.org/TR/webaudio/#gainnode) [createGain](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-creategain) ();
  [IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode) [createIIRFilter](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter) ([sequence](https://heycam.github.io/webidl/#idl-sequence)<[double](https://heycam.github.io/webidl/#idl-double)\> `feedforward`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter-feedforward-feedback-feedforward),
                                 [sequence](https://heycam.github.io/webidl/#idl-sequence)<[double](https://heycam.github.io/webidl/#idl-double)\> `feedback`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter-feedforward-feedback-feedback));
  [OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode) [createOscillator](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createoscillator) ();
  [PannerNode](https://www.w3.org/TR/webaudio/#pannernode) [createPanner](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createpanner) ();
  [PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave) [createPeriodicWave](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave) ([sequence](https://heycam.github.io/webidl/#idl-sequence)<[float](https://heycam.github.io/webidl/#idl-float)\> `real`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-real-imag-constraints-real),
                                   [sequence](https://heycam.github.io/webidl/#idl-sequence)<[float](https://heycam.github.io/webidl/#idl-float)\> `imag`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-real-imag-constraints-imag),
                                   optional [PeriodicWaveConstraints](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveconstraints) `constraints`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-real-imag-constraints-constraints) = {});
  [ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode) [createScriptProcessor](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor)(
    optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [bufferSize](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-buffersize) = 0,
    optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfInputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofinputchannels) = 2,
    optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfOutputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofoutputchannels) = 2);
  [StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode) [createStereoPanner](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createstereopanner) ();
  [WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode) [createWaveShaper](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createwaveshaper) ();

  [Promise](https://heycam.github.io/webidl/#idl-promise)<[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)\> [decodeAudioData](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata) (
    [ArrayBuffer](https://heycam.github.io/webidl/#idl-ArrayBuffer) `audioData`,
    optional [DecodeSuccessCallback](https://www.w3.org/TR/webaudio/#callback-decodesuccesscallback-parameters)? `successCallback`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-audiodata-successcallback-errorcallback-successcallback),
    optional [DecodeErrorCallback](https://www.w3.org/TR/webaudio/#callback-decodeerrorcallback-parameters)? `errorCallback`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-audiodata-successcallback-errorcallback-errorcallback));
};

#### 1.1.1. Attributes[](https://www.w3.org/TR/webaudio/#BaseAudioContext-attributes)

[BaseAudioContext/audioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/audioWorklet "The audioWorklet read-only property of the BaseAudioContext interface returns an instance of AudioWorklet that can be used for adding AudioWorkletProcessor-derived classes which implement custom audio processing.")

Firefox76+SafariNoneChrome66+

___

OperaYesEdge79+

___

Edge (Legacy)NoneIENone

___

Firefox for Android79+iOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera MobileYes

`audioWorklet`, of type [AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet), readonly

Allows access to the `Worklet` object that can import a script containing `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` class definitions via the algorithms defined by [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html) and `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)`.

[BaseAudioContext/currentTime](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime "The currentTime read-only property of the BaseAudioContext interface returns a double representing an ever-increasing hardware timestamp in seconds that can be used for scheduling audio playback, visualizing timelines, etc. It starts at 0.")

In all current engines.

Firefox25+Safari6+Chrome14+

___

Opera15+Edge79+

___

Edge (Legacy)12+IENone

___

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`currentTime`, of type [double](https://heycam.github.io/webidl/#idl-double), readonly

This is the time in seconds of the sample frame immediately following the last sample-frame in the block of audio most recently processed by the context’s rendering graph. If the context’s rendering graph has not yet processed a block of audio, then `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` has a value of zero.

In the time coordinate system of `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, the value of zero corresponds to the first sample-frame in the first block processed by the graph. Elapsed time in this system corresponds to elapsed time in the audio stream generated by the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`, which may not be synchronized with other clocks in the system. (For an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`, since the stream is not being actively played by any device, there is not even an approximation to real time.)

All scheduled times in the Web Audio API are relative to the value of `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

When the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` is in the "`[running](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-running)`" state, the value of this attribute is monotonically increasing and is updated by the rendering thread in uniform increments, corresponding to one [render quantum](https://www.w3.org/TR/webaudio/#render-quantum). Thus, for a running context, `currentTime` increases steadily as the system processes audio blocks, and always represents the time of the start of the next audio block to be processed. It is also the earliest possible time when any change scheduled in the current state might take effect.

`currentTime` MUST be read [atomically](https://www.w3.org/TR/webaudio/#atomically) on the control thread before being returned.

[BaseAudioContext/destination](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/destination "The destination property of the BaseAudioContext interface returns an AudioDestinationNode representing the final destination of all audio in the context. It often represents an actual audio-rendering device such as your device's speakers.")

In all current engines.

Firefox25+Safari6+Chrome14+

___

Opera15+Edge79+

___

Edge (Legacy)12+IENone

___

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`destination`, of type [AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode), readonly

An `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` with a single input representing the final destination for all audio. Usually this will represent the actual audio hardware. All `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s actively rendering audio will directly or indirectly connect to `[destination](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-destination)`.

[BaseAudioContext/listener](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/listener "The listener property of the BaseAudioContext interface returns an AudioListener object that can then be used for implementing 3D audio spatialization.")

In all current engines.

Firefox25+Safari6+Chrome14+

___

Opera15+Edge79+

___

Edge (Legacy)12+IENone

___

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`listener`, of type [AudioListener](https://www.w3.org/TR/webaudio/#audiolistener), readonly

An `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` which is used for 3D [spatialization](https://www.w3.org/TR/webaudio/#Spatialization).

[BaseAudioContext/onstatechange](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/onstatechange "The onstatechange property of the BaseAudioContext interface defines an event handler function to be called when the statechange event fires: this occurs when the audio context's state changes.")

In all current engines.

Firefox40+Safari9+Chrome43+

___

OperaYesEdge79+

___

Edge (Legacy)14+IENone

___

Firefox for Android40+iOS Safari9+Chrome for AndroidYesAndroid WebViewYesSamsung InternetYesOpera MobileYes

`onstatechange`, of type [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)

A property used to set the `EventHandler` for an event that is dispatched to `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` when the state of the AudioContext has changed (i.e. when the corresponding promise would have resolved). An event of type `[Event](https://dom.spec.whatwg.org/#event)` will be dispatched to the event handler, which can query the AudioContext’s state directly. A newly-created AudioContext will always begin in the `suspended` state, and a state change event will be fired whenever the state changes to a different state. This event is fired before the `[oncomplete](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-oncomplete)` event is fired.

[BaseAudioContext/sampleRate](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/sampleRate "The sampleRate property of the BaseAudioContext interface returns a floating point number representing the sample rate, in samples per second, used by all nodes in this audio context.")

In all current engines.

Firefox25+Safari6+Chrome14+

___

Opera15+Edge79+

___

Edge (Legacy)12+IENone

___

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

The sample rate (in sample-frames per second) at which the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` handles audio. It is assumed that all `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s in the context run at this rate. In making this assumption, sample-rate converters or "varispeed" processors are not supported in real-time processing. The Nyquist frequency is half this sample-rate value.

[BaseAudioContext/state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state "The state read-only property of the BaseAudioContext interface returns the current state of the AudioContext.")

In all current engines.

Firefox40+Safari9+Chrome43+

___

<br>

---

├──&nbsp;[./README.md](./README.md)<br>
├──&nbsp;[./r-audio](./r-audio)<br>
&nbsp;&nbsp;├──&nbsp;[./README.md](./r-audio/README.md)<br>
&nbsp;&nbsp;├──&nbsp;[./examples](./r-audio/examples)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/README.md](./r-audio/examples/README.md)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/assets](./r-audio/examples/assets)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/assets/audio](./r-audio/examples/assets/audio)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/assets/audio/a.wav](./r-audio/examples/assets/audio/a.wav)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/assets/audio/b.wav](./r-audio/examples/assets/audio/b.wav)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./examples/assets/audio/clarinet.mp3](./r-audio/examples/assets/audio/clarinet.mp3)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./examples/assets/js](./r-audio/examples/assets/js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./examples/assets/js/bit-crusher.js](./r-audio/examples/assets/js/bit-crusher.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/audio-worklet.js](./r-audio/examples/audio-worklet.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/buffers-channels.js](./r-audio/examples/buffers-channels.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/complex-effects-graph.js](./r-audio/examples/complex-effects-graph.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/custom-nodes.js](./r-audio/examples/custom-nodes.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/delay-lines.js](./r-audio/examples/delay-lines.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/examples.js](./r-audio/examples/examples.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/gain-matrix.js](./r-audio/examples/gain-matrix.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/index.html](./r-audio/examples/index.html)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/index.js](./r-audio/examples/index.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/media-element.js](./r-audio/examples/media-element.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./examples/media-stream.js](./r-audio/examples/media-stream.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./examples/mutation.js](./r-audio/examples/mutation.js)<br>
&nbsp;&nbsp;├──&nbsp;[./index.js](./r-audio/index.js)<br>
&nbsp;&nbsp;├──&nbsp;[./package-lock.json](./r-audio/package-lock.json)<br>
&nbsp;&nbsp;├──&nbsp;[./package.json](./r-audio/package.json)<br>
&nbsp;&nbsp;├──&nbsp;[./src](./r-audio/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes](./r-audio/src/audio-nodes)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/analyser.js](./r-audio/src/audio-nodes/analyser.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/audio-worklet.js](./r-audio/src/audio-nodes/audio-worklet.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/biquad-filter.js](./r-audio/src/audio-nodes/biquad-filter.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/buffer-source.js](./r-audio/src/audio-nodes/buffer-source.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/channel-merger.js](./r-audio/src/audio-nodes/channel-merger.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/channel-splitter.js](./r-audio/src/audio-nodes/channel-splitter.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/constant-source.js](./r-audio/src/audio-nodes/constant-source.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/convolver.js](./r-audio/src/audio-nodes/convolver.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/delay.js](./r-audio/src/audio-nodes/delay.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/dynamics-compressor.js](./r-audio/src/audio-nodes/dynamics-compressor.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/gain.js](./r-audio/src/audio-nodes/gain.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/iir-filter.js](./r-audio/src/audio-nodes/iir-filter.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/index.js](./r-audio/src/audio-nodes/index.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/media-element-source.js](./r-audio/src/audio-nodes/media-element-source.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/media-stream-source.js](./r-audio/src/audio-nodes/media-stream-source.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/oscillator.js](./r-audio/src/audio-nodes/oscillator.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/panner.js](./r-audio/src/audio-nodes/panner.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/audio-nodes/stereo-panner.js](./r-audio/src/audio-nodes/stereo-panner.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/audio-nodes/wave-shaper.js](./r-audio/src/audio-nodes/wave-shaper.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/base](./r-audio/src/base)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/base/audio-context.js](./r-audio/src/base/audio-context.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/base/audio-node.js](./r-audio/src/base/audio-node.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/base/component.js](./r-audio/src/base/component.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/base/connectable-node.js](./r-audio/src/base/connectable-node.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/base/scheduled-source.js](./r-audio/src/base/scheduled-source.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/graph](./r-audio/src/graph)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/graph/cycle.js](./r-audio/src/graph/cycle.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/graph/extensible.js](./r-audio/src/graph/extensible.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/graph/pipeline.js](./r-audio/src/graph/pipeline.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/graph/split-channels.js](./r-audio/src/graph/split-channels.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/graph/split.js](./r-audio/src/graph/split.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/graph/utils.js](./r-audio/src/graph/utils.js)<br>
&nbsp;&nbsp;└──&nbsp;[./webpack.config.js](./r-audio/webpack.config.js)<br>
├──&nbsp;[./react-audio-recorder](./react-audio-recorder)<br>
&nbsp;&nbsp;├──&nbsp;[./README.md](./react-audio-recorder/README.md)<br>
&nbsp;&nbsp;├──&nbsp;[./dist](./react-audio-recorder/dist)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/AudioContext.d.ts](./react-audio-recorder/dist/AudioContext.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/AudioContext.js](./react-audio-recorder/dist/AudioContext.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/AudioRecorder.d.ts](./react-audio-recorder/dist/AudioRecorder.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/AudioRecorder.js](./react-audio-recorder/dist/AudioRecorder.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/dist](./react-audio-recorder/dist/dist)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./dist/dist/AudioRecorder.min.js](./react-audio-recorder/dist/dist/AudioRecorder.min.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/downloadBlob.d.ts](./react-audio-recorder/dist/downloadBlob.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/downloadBlob.js](./react-audio-recorder/dist/downloadBlob.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/getUserMedia.d.ts](./react-audio-recorder/dist/getUserMedia.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/getUserMedia.js](./react-audio-recorder/dist/getUserMedia.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/waveEncoder.d.ts](./react-audio-recorder/dist/waveEncoder.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/waveEncoder.js](./react-audio-recorder/dist/waveEncoder.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./dist/waveInterface.d.ts](./react-audio-recorder/dist/waveInterface.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./dist/waveInterface.js](./react-audio-recorder/dist/waveInterface.js)<br>
&nbsp;&nbsp;├──&nbsp;[./package-lock.json](./react-audio-recorder/package-lock.json)<br>
&nbsp;&nbsp;├──&nbsp;[./package.json](./react-audio-recorder/package.json)<br>
&nbsp;&nbsp;├──&nbsp;[./src](./react-audio-recorder/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/AudioContext.ts](./react-audio-recorder/src/AudioContext.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/AudioRecorder.tsx](./react-audio-recorder/src/AudioRecorder.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/downloadBlob.ts](./react-audio-recorder/src/downloadBlob.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/getUserMedia.ts](./react-audio-recorder/src/getUserMedia.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/waveEncoder.ts](./react-audio-recorder/src/waveEncoder.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/waveInterface.ts](./react-audio-recorder/src/waveInterface.ts)<br>
&nbsp;&nbsp;├──&nbsp;[./tsconfig.json](./react-audio-recorder/tsconfig.json)<br>
&nbsp;&nbsp;├──&nbsp;[./types](./react-audio-recorder/types)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./types/dom.d.ts](./react-audio-recorder/types/dom.d.ts)<br>
&nbsp;&nbsp;└──&nbsp;[./webpack.config.js](./react-audio-recorder/webpack.config.js)<br>
├──&nbsp;[./react-native-voice-processor-main](./react-native-voice-processor-main)<br>
&nbsp;&nbsp;├──&nbsp;[./README.md](./react-native-voice-processor-main/README.md)<br>
&nbsp;&nbsp;├──&nbsp;[./android](./react-native-voice-processor-main/android)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/build.gradle](./react-native-voice-processor-main/android/build.gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/gradle](./react-native-voice-processor-main/android/gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/gradle/wrapper](./react-native-voice-processor-main/android/gradle/wrapper)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/gradle/wrapper/gradle-wrapper.jar](./react-native-voice-processor-main/android/gradle/wrapper/gradle-wrapper.jar)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/gradle/wrapper/gradle-wrapper.properties](./react-native-voice-processor-main/android/gradle/wrapper/gradle-wrapper.properties)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/gradle.properties](./react-native-voice-processor-main/android/gradle.properties)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/gradlew](./react-native-voice-processor-main/android/gradlew)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/gradlew.bat](./react-native-voice-processor-main/android/gradlew.bat)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/settings.gradle](./react-native-voice-processor-main/android/settings.gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src](./react-native-voice-processor-main/android/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main](./react-native-voice-processor-main/android/src/main)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/src/main/AndroidManifest.xml](./react-native-voice-processor-main/android/src/main/AndroidManifest.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main/java](./react-native-voice-processor-main/android/src/main/java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main/java/ai](./react-native-voice-processor-main/android/src/main/java/ai)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main/java/ai/picovoice](./react-native-voice-processor-main/android/src/main/java/ai/picovoice)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main/java/ai/picovoice/reactnative](./react-native-voice-processor-main/android/src/main/java/ai/picovoice/reactnative)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main/java/ai/picovoice/reactnative/voiceprocessor](./react-native-voice-processor-main/android/src/main/java/ai/picovoice/reactnative/voiceprocessor)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./android/src/main/java/ai/picovoice/reactnative/voiceprocessor/VoiceProcessorModule.java](./react-native-voice-processor-main/android/src/main/java/ai/picovoice/reactnative/voiceprocessor/VoiceProcessorModule.java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./android/src/main/java/ai/picovoice/reactnative/voiceprocessor/VoiceProcessorPackage.java](./react-native-voice-processor-main/android/src/main/java/ai/picovoice/reactnative/voiceprocessor/VoiceProcessorPackage.java)<br>
&nbsp;&nbsp;├──&nbsp;[./babel.config.js](./react-native-voice-processor-main/babel.config.js)<br>
&nbsp;&nbsp;├──&nbsp;[./example](./react-native-voice-processor-main/example)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android](./react-native-voice-processor-main/example/android)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app](./react-native-voice-processor-main/example/android/app)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/build.gradle](./react-native-voice-processor-main/example/android/app/build.gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/debug.keystore](./react-native-voice-processor-main/example/android/app/debug.keystore)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/proguard-rules.pro](./react-native-voice-processor-main/example/android/app/proguard-rules.pro)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src](./react-native-voice-processor-main/example/android/app/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/debug](./react-native-voice-processor-main/example/android/app/src/debug)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/debug/AndroidManifest.xml](./react-native-voice-processor-main/example/android/app/src/debug/AndroidManifest.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/debug/java](./react-native-voice-processor-main/example/android/app/src/debug/java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/debug/java/com](./react-native-voice-processor-main/example/android/app/src/debug/java/com)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/debug/java/com/example](./react-native-voice-processor-main/example/android/app/src/debug/java/com/example)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/debug/java/com/example/reactnativevoiceprocessor](./react-native-voice-processor-main/example/android/app/src/debug/java/com/example/reactnativevoiceprocessor)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/debug/java/com/example/reactnativevoiceprocessor/ReactNativeFlipper.java](./react-native-voice-processor-main/example/android/app/src/debug/java/com/example/reactnativevoiceprocessor/ReactNativeFlipper.java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main](./react-native-voice-processor-main/example/android/app/src/main)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/AndroidManifest.xml](./react-native-voice-processor-main/example/android/app/src/main/AndroidManifest.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/java](./react-native-voice-processor-main/example/android/app/src/main/java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/java/ai](./react-native-voice-processor-main/example/android/app/src/main/java/ai)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/java/ai/picovoice](./react-native-voice-processor-main/example/android/app/src/main/java/ai/picovoice)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/java/ai/picovoice/reactnative](./react-native-voice-processor-main/example/android/app/src/main/java/ai/picovoice/reactnative)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/java/ai/picovoice/reactnative/voiceprocessorexample](./react-native-voice-processor-main/example/android/app/src/main/java/ai/picovoice/reactnative/voiceprocessorexample)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/java/ai/picovoice/reactnative/voiceprocessorexample/MainActivity.java](./react-native-voice-processor-main/example/android/app/src/main/java/ai/picovoice/reactnative/voiceprocessorexample/MainActivity.java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/java/ai/picovoice/reactnative/voiceprocessorexample/MainApplication.java](./react-native-voice-processor-main/example/android/app/src/main/java/ai/picovoice/reactnative/voiceprocessorexample/MainApplication.java)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res](./react-native-voice-processor-main/example/android/app/src/main/res)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/drawable](./react-native-voice-processor-main/example/android/app/src/main/res/drawable)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/drawable/ic_launcher_background.xml](./react-native-voice-processor-main/example/android/app/src/main/res/drawable/ic_launcher_background.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/drawable/ic_launcher_foreground.xml](./react-native-voice-processor-main/example/android/app/src/main/res/drawable/ic_launcher_foreground.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-anydpi-v26](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-anydpi-v26)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-hdpi](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-hdpi)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-hdpi/ic_launcher.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-hdpi/ic_launcher.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-mdpi](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-mdpi)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-mdpi/ic_launcher.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-mdpi/ic_launcher.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-xhdpi](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xhdpi)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xhdpi/ic_launcher.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-xxhdpi](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xxhdpi)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-xxxhdpi](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xxxhdpi)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png](./react-native-voice-processor-main/example/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/values](./react-native-voice-processor-main/example/android/app/src/main/res/values)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/app/src/main/res/values/strings.xml](./react-native-voice-processor-main/example/android/app/src/main/res/values/strings.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/app/src/main/res/values/styles.xml](./react-native-voice-processor-main/example/android/app/src/main/res/values/styles.xml)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/build.gradle](./react-native-voice-processor-main/example/android/build.gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/gradle](./react-native-voice-processor-main/example/android/gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/gradle/wrapper](./react-native-voice-processor-main/example/android/gradle/wrapper)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/gradle/wrapper/gradle-wrapper.jar](./react-native-voice-processor-main/example/android/gradle/wrapper/gradle-wrapper.jar)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/gradle/wrapper/gradle-wrapper.properties](./react-native-voice-processor-main/example/android/gradle/wrapper/gradle-wrapper.properties)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/gradle.properties](./react-native-voice-processor-main/example/android/gradle.properties)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/gradlew](./react-native-voice-processor-main/example/android/gradlew)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/android/gradlew.bat](./react-native-voice-processor-main/example/android/gradlew.bat)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/android/settings.gradle](./react-native-voice-processor-main/example/android/settings.gradle)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/app.json](./react-native-voice-processor-main/example/app.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/babel.config.js](./react-native-voice-processor-main/example/babel.config.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/index.tsx](./react-native-voice-processor-main/example/index.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios](./react-native-voice-processor-main/example/ios)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/File.swift](./react-native-voice-processor-main/example/ios/File.swift)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/Podfile](./react-native-voice-processor-main/example/ios/Podfile)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/Podfile.lock](./react-native-voice-processor-main/example/ios/Podfile.lock)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample](./react-native-voice-processor-main/example/ios/VoiceProcessorExample)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/AppDelegate.h](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/AppDelegate.h)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/AppDelegate.m](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/AppDelegate.m)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Base.lproj](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Base.lproj)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample/Base.lproj/LaunchScreen.xib](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Base.lproj/LaunchScreen.xib)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/Contents.json](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/Contents.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-1024.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-1024.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-20.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-20.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-20@2x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-20@2x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-20@3x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-20@3x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-29.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-29.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-29@2x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-29@2x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-29@3x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-29@3x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-40.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-40.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-40@2x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-40@2x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-40@3x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-40@3x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-60@2x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-60@2x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-60@3x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-60@3x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-76.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-76.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-76@2x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-76@2x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-83.5@2x.png](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/AppIcon.appiconset/pv_circle_512-83.5@2x.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample/Images.xcassets/Contents.json](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Images.xcassets/Contents.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample/Info.plist](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/Info.plist)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample/main.m](./react-native-voice-processor-main/example/ios/VoiceProcessorExample/main.m)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample-Bridging-Header.h](./react-native-voice-processor-main/example/ios/VoiceProcessorExample-Bridging-Header.h)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample.xcodeproj](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcodeproj)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample.xcodeproj/project.pbxproj](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcodeproj/project.pbxproj)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample.xcodeproj/xcshareddata](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcodeproj/xcshareddata)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample.xcodeproj/xcshareddata/xcschemes](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcodeproj/xcshareddata/xcschemes)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample.xcodeproj/xcshareddata/xcschemes/VoiceProcessorExample.xcscheme](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcodeproj/xcshareddata/xcschemes/VoiceProcessorExample.xcscheme)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample.xcworkspace](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcworkspace)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/ios/VoiceProcessorExample.xcworkspace/contents.xcworkspacedata](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcworkspace/contents.xcworkspacedata)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample.xcworkspace/xcshareddata](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcworkspace/xcshareddata)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/ios/VoiceProcessorExample.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist](./react-native-voice-processor-main/example/ios/VoiceProcessorExample.xcworkspace/xcshareddata/IDEWorkspaceChecks.plist)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/metro.config.js](./react-native-voice-processor-main/example/metro.config.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/package-lock.json](./react-native-voice-processor-main/example/package-lock.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/package.json](./react-native-voice-processor-main/example/package.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./example/src](./react-native-voice-processor-main/example/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/src/App.tsx](./react-native-voice-processor-main/example/src/App.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./example/yarn.lock](./react-native-voice-processor-main/example/yarn.lock)<br>
&nbsp;&nbsp;├──&nbsp;[./ios](./react-native-voice-processor-main/ios)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./ios/VoiceProcessor-Bridging-Header.h](./react-native-voice-processor-main/ios/VoiceProcessor-Bridging-Header.h)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./ios/VoiceProcessor.m](./react-native-voice-processor-main/ios/VoiceProcessor.m)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./ios/VoiceProcessor.swift](./react-native-voice-processor-main/ios/VoiceProcessor.swift)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./ios/VoiceProcessor.xcodeproj](./react-native-voice-processor-main/ios/VoiceProcessor.xcodeproj)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./ios/VoiceProcessor.xcodeproj/project.pbxproj](./react-native-voice-processor-main/ios/VoiceProcessor.xcodeproj/project.pbxproj)<br>
&nbsp;&nbsp;├──&nbsp;[./package.json](./react-native-voice-processor-main/package.json)<br>
&nbsp;&nbsp;├──&nbsp;[./react-native-voice-processor.podspec](./react-native-voice-processor-main/react-native-voice-processor.podspec)<br>
&nbsp;&nbsp;├──&nbsp;[./src](./react-native-voice-processor-main/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/index.tsx](./react-native-voice-processor-main/src/index.tsx)<br>
&nbsp;&nbsp;├──&nbsp;[./tsconfig.json](./react-native-voice-processor-main/tsconfig.json)<br>
&nbsp;&nbsp;└──&nbsp;[./yarn.lock](./react-native-voice-processor-main/yarn.lock)<br>
├──&nbsp;[./react-player](./react-player)<br>
&nbsp;&nbsp;├──&nbsp;[./README.md](./react-player/README.md)<br>
&nbsp;&nbsp;├──&nbsp;[./config](./react-player/config)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/env.js](./react-player/config/env.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/jest](./react-player/config/jest)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/jest/cssTransform.js](./react-player/config/jest/cssTransform.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./config/jest/fileTransform.js](./react-player/config/jest/fileTransform.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/modules.js](./react-player/config/modules.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/paths.js](./react-player/config/paths.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/pnpTs.js](./react-player/config/pnpTs.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./config/webpack.config.js](./react-player/config/webpack.config.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./config/webpackDevServer.config.js](./react-player/config/webpackDevServer.config.js)<br>
&nbsp;&nbsp;├──&nbsp;[./package.json](./react-player/package.json)<br>
&nbsp;&nbsp;├──&nbsp;[./public](./react-player/public)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/16x16_radius.png](./react-player/public/16x16_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/24x24_radius.png](./react-player/public/24x24_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/32x32_radius.png](./react-player/public/32x32_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/64x64_radius.png](./react-player/public/64x64_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/\_redirects](./react-player/public/_redirects)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/favicon.png](./react-player/public/favicon.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./public/index.html](./react-player/public/index.html)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./public/manifest.json](./react-player/public/manifest.json)<br>
&nbsp;&nbsp;├──&nbsp;[./scripts](./react-player/scripts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./scripts/build.js](./react-player/scripts/build.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./scripts/start.js](./react-player/scripts/start.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./scripts/test.js](./react-player/scripts/test.js)<br>
&nbsp;&nbsp;├──&nbsp;[./src](./react-player/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/App.test.js](./react-player/src/App.test.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets](./react-player/src/assets)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css](./react-player/src/assets/css)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css/base.styl](./react-player/src/assets/css/base.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/css/mixins](./react-player/src/assets/css/mixins)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css/mixins/animations.styl](./react-player/src/assets/css/mixins/animations.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css/mixins/breakpoints.styl](./react-player/src/assets/css/mixins/breakpoints.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css/mixins/colors.styl](./react-player/src/assets/css/mixins/colors.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css/mixins/reset.styl](./react-player/src/assets/css/mixins/reset.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/css/mixins/root.styl](./react-player/src/assets/css/mixins/root.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/css/mixins/zindex.styl](./react-player/src/assets/css/mixins/zindex.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/github](./react-player/src/assets/github)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/github/GitHub-Mark-Light-32px.png](./react-player/src/assets/github/GitHub-Mark-Light-32px.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo](./react-player/src/assets/logo)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/16x16.png](./react-player/src/assets/logo/16x16.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/16x16.svg](./react-player/src/assets/logo/16x16.svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/16x16_radius.png](./react-player/src/assets/logo/16x16_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/24x24.png](./react-player/src/assets/logo/24x24.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/24x24.svg](./react-player/src/assets/logo/24x24.svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/24x24_radius.png](./react-player/src/assets/logo/24x24_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/32x32.png](./react-player/src/assets/logo/32x32.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/32x32.svg](./react-player/src/assets/logo/32x32.svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/32x32_radius.png](./react-player/src/assets/logo/32x32_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/64x64.png](./react-player/src/assets/logo/64x64.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/64x64.svg](./react-player/src/assets/logo/64x64.svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/64x64_radius.png](./react-player/src/assets/logo/64x64_radius.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/logo/audio-player.ai](./react-player/src/assets/logo/audio-player.ai)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/logo/audio-player_radius.ai](./react-player/src/assets/logo/audio-player_radius.ai)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/music](./react-player/src/assets/music)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/music/fantastic.mp3](./react-player/src/assets/music/fantastic.mp3)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/music/legends-never-die.mp3](./react-player/src/assets/music/legends-never-die.mp3)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/music/rise.mp3](./react-player/src/assets/music/rise.mp3)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/music/short-legends-never-die.mp3](./react-player/src/assets/music/short-legends-never-die.mp3)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/spotify](./react-player/src/assets/spotify)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/spotify/icon](./react-player/src/assets/spotify/icon)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/spotify/icon/Spotify_Icon_RGB_Black.png](./react-player/src/assets/spotify/icon/Spotify_Icon_RGB_Black.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/spotify/icon/Spotify_Icon_RGB_Green.png](./react-player/src/assets/spotify/icon/Spotify_Icon_RGB_Green.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/spotify/icon/Spotify_Icon_RGB_White.png](./react-player/src/assets/spotify/icon/Spotify_Icon_RGB_White.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/spotify/logo](./react-player/src/assets/spotify/logo)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/spotify/logo/Spotify_Logo_RGB_Black.png](./react-player/src/assets/spotify/logo/Spotify_Logo_RGB_Black.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/assets/spotify/logo/Spotify_Logo_RGB_Green.png](./react-player/src/assets/spotify/logo/Spotify_Logo_RGB_Green.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/spotify/logo/Spotify_Logo_RGB_White.png](./react-player/src/assets/spotify/logo/Spotify_Logo_RGB_White.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/svg](./react-player/src/assets/svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/assets/svg/logo.svg](./react-player/src/assets/svg/logo.svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components](./react-player/src/components)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/\_boilerplate](./react-player/src/components/_boilerplate)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/\_boilerplate/index.jsx](./react-player/src/components/_boilerplate/index.jsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/components/\_boilerplate/style.styl](./react-player/src/components/_boilerplate/style.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/app-footer-nav](./react-player/src/components/app-footer-nav)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/app-footer-nav/index.jsx](./react-player/src/components/app-footer-nav/index.jsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/components/app-footer-nav/style.styl](./react-player/src/components/app-footer-nav/style.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/app-version](./react-player/src/components/app-version)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/app-version/index.jsx](./react-player/src/components/app-version/index.jsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/components/app-version/style.styl](./react-player/src/components/app-version/style.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/components/audio](./react-player/src/components/audio)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/audio/audio.worker.js](./react-player/src/components/audio/audio.worker.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/components/audio/index.jsx](./react-player/src/components/audio/index.jsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/components/audio/style.styl](./react-player/src/components/audio/style.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/context](./react-player/src/context)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/context/app-context.jsx](./react-player/src/context/app-context.jsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/export-components.js](./react-player/src/export-components.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/index.js](./react-player/src/index.js)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/modules](./react-player/src/modules)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/modules/app](./react-player/src/modules/app)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./src/modules/app/index.jsx](./react-player/src/modules/app/index.jsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/modules/app/style.styl](./react-player/src/modules/app/style.styl)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./src/serviceWorker.js](./react-player/src/serviceWorker.js)<br>
&nbsp;&nbsp;└──&nbsp;[./yarn.lock](./react-player/yarn.lock)<br>
└──&nbsp;[./react-web-audio-graph](./react-web-audio-graph)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/README.md](./react-web-audio-graph/README.md)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/package.json](./react-web-audio-graph/package.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/public](./react-web-audio-graph/public)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/public/favicon.ico](./react-web-audio-graph/public/favicon.ico)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/public/index.html](./react-web-audio-graph/public/index.html)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/public/logo192.png](./react-web-audio-graph/public/logo192.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/public/logo512.png](./react-web-audio-graph/public/logo512.png)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/public/manifest.json](./react-web-audio-graph/public/manifest.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/public/robots.txt](./react-web-audio-graph/public/robots.txt)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src](./react-web-audio-graph/src)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/App.tsx](./react-web-audio-graph/src/App.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components](./react-web-audio-graph/src/components)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/Audio.tsx](./react-web-audio-graph/src/components/Audio.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/ContextMenu.tsx](./react-web-audio-graph/src/components/ContextMenu.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/Flow.tsx](./react-web-audio-graph/src/components/Flow.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/FlowContextMenu.tsx](./react-web-audio-graph/src/components/FlowContextMenu.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/Node.tsx](./react-web-audio-graph/src/components/Node.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/Nodes.tsx](./react-web-audio-graph/src/components/Nodes.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/Note.tsx](./react-web-audio-graph/src/components/Note.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/Project.tsx](./react-web-audio-graph/src/components/Project.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/controls](./react-web-audio-graph/src/components/controls)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/controls/Slider.tsx](./react-web-audio-graph/src/components/controls/Slider.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/components/controls/Toggle.tsx](./react-web-audio-graph/src/components/controls/Toggle.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/components/nodes](./react-web-audio-graph/src/components/nodes)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/ADSR.tsx](./react-web-audio-graph/src/components/nodes/ADSR.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Analyser](./react-web-audio-graph/src/components/nodes/Analyser)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Analyser/Visualiser.tsx](./react-web-audio-graph/src/components/nodes/Analyser/Visualiser.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/components/nodes/Analyser/index.tsx](./react-web-audio-graph/src/components/nodes/Analyser/index.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/AndGate.tsx](./react-web-audio-graph/src/components/nodes/AndGate.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/AudioBufferSource.tsx](./react-web-audio-graph/src/components/nodes/AudioBufferSource.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/BiquadFilter.tsx](./react-web-audio-graph/src/components/nodes/BiquadFilter.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/ChannelMerger.tsx](./react-web-audio-graph/src/components/nodes/ChannelMerger.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/ChannelSplitter.tsx](./react-web-audio-graph/src/components/nodes/ChannelSplitter.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Comparator.tsx](./react-web-audio-graph/src/components/nodes/Comparator.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/ConstantSource.tsx](./react-web-audio-graph/src/components/nodes/ConstantSource.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Delay.tsx](./react-web-audio-graph/src/components/nodes/Delay.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/DelayEffect.tsx](./react-web-audio-graph/src/components/nodes/DelayEffect.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Destination.tsx](./react-web-audio-graph/src/components/nodes/Destination.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/DynamicsCompressor.tsx](./react-web-audio-graph/src/components/nodes/DynamicsCompressor.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Equalizer.tsx](./react-web-audio-graph/src/components/nodes/Equalizer.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Gain.tsx](./react-web-audio-graph/src/components/nodes/Gain.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Gate.tsx](./react-web-audio-graph/src/components/nodes/Gate.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/InputSwitch.tsx](./react-web-audio-graph/src/components/nodes/InputSwitch.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Keyboard.css](./react-web-audio-graph/src/components/nodes/Keyboard.css)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Keyboard.tsx](./react-web-audio-graph/src/components/nodes/Keyboard.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Meter.tsx](./react-web-audio-graph/src/components/nodes/Meter.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Metronome.tsx](./react-web-audio-graph/src/components/nodes/Metronome.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Noise.tsx](./react-web-audio-graph/src/components/nodes/Noise.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/NotGate.tsx](./react-web-audio-graph/src/components/nodes/NotGate.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/OrGate.tsx](./react-web-audio-graph/src/components/nodes/OrGate.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Oscillator.tsx](./react-web-audio-graph/src/components/nodes/Oscillator.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/OscillatorNote.tsx](./react-web-audio-graph/src/components/nodes/OscillatorNote.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/OutputSwitch.tsx](./react-web-audio-graph/src/components/nodes/OutputSwitch.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Quantizer.tsx](./react-web-audio-graph/src/components/nodes/Quantizer.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Rectifier.tsx](./react-web-audio-graph/src/components/nodes/Rectifier.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/SampleAndHold.tsx](./react-web-audio-graph/src/components/nodes/SampleAndHold.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Sign.tsx](./react-web-audio-graph/src/components/nodes/Sign.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/StereoPanner.tsx](./react-web-audio-graph/src/components/nodes/StereoPanner.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/Transformer.tsx](./react-web-audio-graph/src/components/nodes/Transformer.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/components/nodes/WaveShaper.tsx](./react-web-audio-graph/src/components/nodes/WaveShaper.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/components/nodes/XorGate.tsx](./react-web-audio-graph/src/components/nodes/XorGate.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/context](./react-web-audio-graph/src/context)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/context/AudioContextContext.tsx](./react-web-audio-graph/src/context/AudioContextContext.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/context/ContextMenuContext.tsx](./react-web-audio-graph/src/context/ContextMenuContext.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/context/NodeContext.tsx](./react-web-audio-graph/src/context/NodeContext.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/context/ProjectContext.tsx](./react-web-audio-graph/src/context/ProjectContext.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/fonts](./react-web-audio-graph/src/fonts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/fonts/bravura](./react-web-audio-graph/src/fonts/bravura)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/fonts/bravura/bravura.css](./react-web-audio-graph/src/fonts/bravura/bravura.css)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/fonts/bravura/bravura.woff](./react-web-audio-graph/src/fonts/bravura/bravura.woff)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/fonts/bravura/bravura.woff2](./react-web-audio-graph/src/fonts/bravura/bravura.woff2)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks](./react-web-audio-graph/src/hooks)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes](./react-web-audio-graph/src/hooks/nodes)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useAnalyserNode.tsx](./react-web-audio-graph/src/hooks/nodes/useAnalyserNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useAudioWorkletNode.tsx](./react-web-audio-graph/src/hooks/nodes/useAudioWorkletNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useBiquadFilterNode.tsx](./react-web-audio-graph/src/hooks/nodes/useBiquadFilterNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useChannelMergerNode.tsx](./react-web-audio-graph/src/hooks/nodes/useChannelMergerNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useChannelSplitterNode.tsx](./react-web-audio-graph/src/hooks/nodes/useChannelSplitterNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useConstantSourceNode.tsx](./react-web-audio-graph/src/hooks/nodes/useConstantSourceNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useDelayNode.tsx](./react-web-audio-graph/src/hooks/nodes/useDelayNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useDestinationNode.tsx](./react-web-audio-graph/src/hooks/nodes/useDestinationNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useDynamicsCompressorNode.tsx](./react-web-audio-graph/src/hooks/nodes/useDynamicsCompressorNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useGainNode.tsx](./react-web-audio-graph/src/hooks/nodes/useGainNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useOscillatorNode.tsx](./react-web-audio-graph/src/hooks/nodes/useOscillatorNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useStereoPannerNode.tsx](./react-web-audio-graph/src/hooks/nodes/useStereoPannerNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/hooks/nodes/useWaveShaperNode.tsx](./react-web-audio-graph/src/hooks/nodes/useWaveShaperNode.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/hooks/useAnimationFrame.ts](./react-web-audio-graph/src/hooks/useAnimationFrame.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/index.css](./react-web-audio-graph/src/index.css)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/index.tsx](./react-web-audio-graph/src/index.tsx)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/logo.svg](./react-web-audio-graph/src/logo.svg)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/react-app-env.d.ts](./react-web-audio-graph/src/react-app-env.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/reportWebVitals.ts](./react-web-audio-graph/src/reportWebVitals.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/setupTests.ts](./react-web-audio-graph/src/setupTests.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/types](./react-web-audio-graph/src/types)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/types/AudioWorkletGlobalScope.d.ts](./react-web-audio-graph/src/types/AudioWorkletGlobalScope.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/types/AudioWorkletProcessor.d.ts](./react-web-audio-graph/src/types/AudioWorkletProcessor.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/types/worklet-loader.d.ts](./react-web-audio-graph/src/types/worklet-loader.d.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/utils](./react-web-audio-graph/src/utils)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/utils/audioContext.ts](./react-web-audio-graph/src/utils/audioContext.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/utils/channels.ts](./react-web-audio-graph/src/utils/channels.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/utils/handles.ts](./react-web-audio-graph/src/utils/handles.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/utils/notes.ts](./react-web-audio-graph/src/utils/notes.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/utils/scale.ts](./react-web-audio-graph/src/utils/scale.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/utils/units.ts](./react-web-audio-graph/src/utils/units.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/worklets](./react-web-audio-graph/src/worklets)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/StoppableAudioWorkletProcessor.ts](./react-web-audio-graph/src/worklets/StoppableAudioWorkletProcessor.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/adsr-processor.types.ts](./react-web-audio-graph/src/worklets/adsr-processor.types.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/adsr-processor.worklet.ts](./react-web-audio-graph/src/worklets/adsr-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/and-gate-processor.worklet.ts](./react-web-audio-graph/src/worklets/and-gate-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/comparator-processor.worklet.ts](./react-web-audio-graph/src/worklets/comparator-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/gate-processor.worklet.ts](./react-web-audio-graph/src/worklets/gate-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/meter-processor.worklet.ts](./react-web-audio-graph/src/worklets/meter-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/noise-processor.types.ts](./react-web-audio-graph/src/worklets/noise-processor.types.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/noise-processor.worklet.ts](./react-web-audio-graph/src/worklets/noise-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/not-gate-processor.worklet.ts](./react-web-audio-graph/src/worklets/not-gate-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/or-gate-processor.worklet.ts](./react-web-audio-graph/src/worklets/or-gate-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/quantizer-processor.worklet.ts](./react-web-audio-graph/src/worklets/quantizer-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/rectifier-processor.types.ts](./react-web-audio-graph/src/worklets/rectifier-processor.types.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/rectifier-processor.worklet.ts](./react-web-audio-graph/src/worklets/rectifier-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/sample-and-hold-processor.types.ts](./react-web-audio-graph/src/worklets/sample-and-hold-processor.types.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/sample-and-hold-processor.worklet.ts](./react-web-audio-graph/src/worklets/sample-and-hold-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/sign-processor.worklet.ts](./react-web-audio-graph/src/worklets/sign-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/src/worklets/transformer-processor.worklet.ts](./react-web-audio-graph/src/worklets/transformer-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/src/worklets/xor-gate-processor.worklet.ts](./react-web-audio-graph/src/worklets/xor-gate-processor.worklet.ts)<br>
&nbsp;&nbsp;&nbsp;&nbsp;├──&nbsp;[./react-web-audio-graph/tsconfig.json](./react-web-audio-graph/tsconfig.json)<br>
&nbsp;&nbsp;&nbsp;&nbsp;└──&nbsp;[./react-web-audio-graph/yarn.lock](./react-web-audio-graph/yarn.lock)<br>
<br>


---
