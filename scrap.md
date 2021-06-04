# React Audio Components (JS & TSX)

---

## WEB Audio API:

## Introduction

Audio on the web has been fairly primitive up to this point and until very recently has had to be delivered through plugins such as Flash and QuickTime. The introduction of the `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` element in HTML5 is very important, allowing for basic streaming audio playback. But, it is not powerful enough to handle more complex audio applications. For sophisticated web-based games or interactive applications, another solution is required. It is a goal of this specification to include the capabilities found in modern game audio engines as well as some of the mixing, processing, and filtering tasks that are found in modern desktop audio production applications.

The APIs have been designed with a wide variety of use cases [\[webaudio-usecases\]](https://www.w3.org/TR/webaudio/#biblio-webaudio-usecases) in mind. Ideally, it should be able to support _any_ use case which could reasonably be implemented with an optimized C++ engine controlled via script and run in a browser. That said, modern desktop audio software can have very advanced capabilities, some of which would be difficult or impossible to build with this system. Apple’s Logic Audio is one such application which has support for external MIDI controllers, arbitrary plugin audio effects and synthesizers, highly optimized direct-to-disk audio file reading/writing, tightly integrated time-stretching, and so on. Nevertheless, the proposed system will be quite capable of supporting a large range of reasonably complex games and interactive applications, including musical ones. And it can be a very good complement to the more advanced graphics features offered by WebGL. The API has been designed so that more advanced capabilities can be added at a later time.

### Features

The API supports these primary features:

- [Modular routing](https://www.w3.org/TR/webaudio/#ModularRouting) for simple or complex mixing/effect architectures.
- High dynamic range, using 32-bit floats for internal processing.
- [Sample-accurate scheduled sound playback](https://www.w3.org/TR/webaudio/#AudioParam) with low [latency](https://www.w3.org/TR/webaudio/#latency) for musical applications requiring a very high degree of rhythmic precision such as drum machines and sequencers. This also includes the possibility of [dynamic creation](https://www.w3.org/TR/webaudio/#DynamicLifetime) of effects.
- Automation of audio parameters for envelopes, fade-ins / fade-outs, granular effects, filter sweeps, LFOs etc.
- Flexible handling of channels in an audio stream, allowing them to be split and merged.
- Processing of audio sources from an `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` or `[video](https://html.spec.whatwg.org/multipage/media.html#video)` `[media element](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`.
- Processing live audio input using a `[MediaStream](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` from `[getUserMedia()](https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia)`.
- Integration with WebRTC

  - Processing audio received from a remote peer using a `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` and [\[webrtc\]](https://www.w3.org/TR/webaudio/#biblio-webrtc).
  - Sending a generated or processed audio stream to a remote peer using a `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)` and [\[webrtc\]](https://www.w3.org/TR/webaudio/#biblio-webrtc).

- Audio stream synthesis and processing [directly using scripts](https://www.w3.org/TR/webaudio/#AudioWorklet).
- [Spatialized audio](https://www.w3.org/TR/webaudio/#Spatialization) supporting a wide range of 3D games and immersive environments:

  - Panning models: equalpower, HRTF, pass-through
  - Distance Attenuation
  - Sound Cones
  - Obstruction / Occlusion
  - Source / Listener based

- A convolution engine for a wide range of linear effects, especially very high-quality room effects. Here are some examples of possible effects:

  - Small / large room
  - Cathedral
  - Concert hall
  - Cave
  - Tunnel
  - Hallway
  - Forest
  - Amphitheater
  - Sound of a distant room through a doorway
  - Extreme filters
  - Strange backwards effects
  - Extreme comb filter effects

- Dynamics compression for overall control and sweetening of the mix
- Efficient [real-time time-domain and frequency-domain analysis / music visualizer support](https://www.w3.org/TR/webaudio/#AnalyserNode).
- Efficient biquad filters for lowpass, highpass, and other common filters.
- A Waveshaping effect for distortion and other non-linear effects
- Oscillators

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

- An [AudioContext](https://www.w3.org/TR/webaudio/#AudioContext) interface, which contains an audio signal graph representing connections between `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s.
- An `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` interface, which represents audio sources, audio outputs, and intermediate processing modules. `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s can be dynamically connected together in a [modular fashion](https://www.w3.org/TR/webaudio/#ModularRouting). `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s exist in the context of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.
- An `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for use with music visualizers, or other visualization applications.
- An `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` interface, for working with memory-resident audio assets. These can represent one-shot sounds, or longer audio clips.
- An `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which generates audio from an AudioBuffer.
- An `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` subclass representing the final destination for all rendered audio.
- An `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` interface, for controlling an individual aspect of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`'s functioning, such as volume.
- An `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` interface, which works with a `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` for spatialization.
- An `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)` interface representing a factory for creating custom nodes that can process audio directly using scripts.
- An `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` interface, the context in which AudioWorkletProcessor processing scripts run.
- An `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` representing a node processed in an AudioWorkletProcessor.
- An `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` interface, representing a single node instance inside an audio worker.
- A `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for common low-order filters such as:

  - Low Pass
  - High Pass
  - Band Pass
  - Low Shelf
  - High Shelf
  - Peaking
  - Notch
  - Allpass

- A `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for combining channels from multiple audio streams into a single audio stream.
- A `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for accessing the individual channels of an audio stream in the routing graph.
- A `[ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for generating a nominally constant output value with an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` to allow automation of the value.
- A `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for applying a real-time linear effect (such as the sound of a concert hall).
- A `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which applies a dynamically adjustable variable delay.
- A `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for dynamics compression.
- A `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for explicit gain control.
- An `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for a general IIR filter.
- A `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio source from an `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)`, `[video](https://html.spec.whatwg.org/multipage/media.html#video)`, or other media element.
- A `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio source from a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` such as live audio input, or from a remote peer.
- A `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio source from a `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)`.
- A `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which is the audio destination to a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` sent to a remote peer.
- A `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for spatializing / positioning audio in 3D space.
- A `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` interface for specifying custom periodic waveforms for use by the `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.
- An `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for generating a periodic waveform.
- A `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for equal-power positioning of audio input in a stereo stream.
- A `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which applies a non-linear waveshaping effect for distortion and other more subtle warming effects.

There are also several features that have been deprecated from the Web Audio API but not yet removed, pending implementation experience of their replacements:

- A `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` interface, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for generating or processing audio directly using scripts.
- An `[AudioProcessingEvent](https://www.w3.org/TR/webaudio/#audioprocessingevent)` interface, which is an event type used with `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` objects.

## 1\. The Audio API[](https://www.w3.org/TR/webaudio/#audioapi)

### 1.1. The `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` Interface[](https://www.w3.org/TR/webaudio/#BaseAudioContext)

[BaseAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext "The BaseAudioContext interface of the Web Audio API acts as a base definition for online and offline audio-processing graphs, as represented by AudioContext and OfflineAudioContext respectively. You wouldn't use BaseAudioContext directly — you'd use its features via one of these two inheriting interfaces.The BaseAudioContext interface of the Web Audio API acts as a base definition for online and offline audio-processing graphs, as represented by AudioContext and OfflineAudioContext respectively.")

Firefox53+SafariNoneChrome56+

---

Opera43+Edge79+

---

Edge (Legacy)NoneIENone

---

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

---

OperaYesEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera MobileYes

`audioWorklet`, of type [AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet), readonly

Allows access to the `Worklet` object that can import a script containing `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` class definitions via the algorithms defined by [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html) and `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)`.

[BaseAudioContext/currentTime](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime "The currentTime read-only property of the BaseAudioContext interface returns a double representing an ever-increasing hardware timestamp in seconds that can be used for scheduling audio playback, visualizing timelines, etc. It starts at 0.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

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

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`destination`, of type [AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode), readonly

An `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` with a single input representing the final destination for all audio. Usually this will represent the actual audio hardware. All `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s actively rendering audio will directly or indirectly connect to `[destination](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-destination)`.

[BaseAudioContext/listener](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/listener "The listener property of the BaseAudioContext interface returns an AudioListener object that can then be used for implementing 3D audio spatialization.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`listener`, of type [AudioListener](https://www.w3.org/TR/webaudio/#audiolistener), readonly

An `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` which is used for 3D [spatialization](https://www.w3.org/TR/webaudio/#Spatialization).

[BaseAudioContext/onstatechange](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/onstatechange "The onstatechange property of the BaseAudioContext interface defines an event handler function to be called when the statechange event fires: this occurs when the audio context's state changes.")

In all current engines.

Firefox40+Safari9+Chrome43+

---

OperaYesEdge79+

---

Edge (Legacy)14+IENone

---

Firefox for Android40+iOS Safari9+Chrome for AndroidYesAndroid WebViewYesSamsung InternetYesOpera MobileYes

`onstatechange`, of type [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)

A property used to set the `EventHandler` for an event that is dispatched to `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` when the state of the AudioContext has changed (i.e. when the corresponding promise would have resolved). An event of type `[Event](https://dom.spec.whatwg.org/#event)` will be dispatched to the event handler, which can query the AudioContext’s state directly. A newly-created AudioContext will always begin in the `suspended` state, and a state change event will be fired whenever the state changes to a different state. This event is fired before the `[oncomplete](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-oncomplete)` event is fired.

[BaseAudioContext/sampleRate](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/sampleRate "The sampleRate property of the BaseAudioContext interface returns a floating point number representing the sample rate, in samples per second, used by all nodes in this audio context.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

The sample rate (in sample-frames per second) at which the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` handles audio. It is assumed that all `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s in the context run at this rate. In making this assumption, sample-rate converters or "varispeed" processors are not supported in real-time processing. The Nyquist frequency is half this sample-rate value.

[BaseAudioContext/state](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/state "The state read-only property of the BaseAudioContext interface returns the current state of the AudioContext.")

In all current engines.

Firefox40+Safari9+Chrome43+

---

OperaYesEdge79+

---

Edge (Legacy)14+IENone

---

Firefox for Android40+iOS Safari9+Chrome for AndroidYesAndroid WebViewYesSamsung InternetYesOpera MobileYes

`state`, of type [AudioContextState](https://www.w3.org/TR/webaudio/#enumdef-audiocontextstate), readonly

Describes the current state of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`. Getting this attribute returns the contents of the `[[[control thread state]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-control-thread-state-slot)` slot.

#### 1.1.2. Methods[](https://www.w3.org/TR/webaudio/#BaseAudioContent-methods)

[BaseAudioContext/createAnalyser](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser "The createAnalyser() method of the BaseAudioContext interface creates an AnalyserNode, which can be used to expose audio time and frequency data and create data visualisations.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createAnalyser()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for an `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)`.

_No parameters._

[BaseAudioContext/createBiquadFilter](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBiquadFilter "The createBiquadFilter() method of the BaseAudioContext interface creates a BiquadFilterNode, which represents a second order filter configurable as several different common filter types.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createBiquadFilter()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` representing a second order filter which can be configured as one of several common filter types.

_No parameters._

[BaseAudioContext/createBuffer](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBuffer "The createBuffer() method of the BaseAudioContext Interface is used to create a new, empty AudioBuffer object, which can then be populated by data, and played via an AudioBufferSourceNode")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createBuffer(numberOfChannels, length, sampleRate)`

Creates an AudioBuffer of the given size. The audio data in the buffer will be zero-initialized (silent). A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown if any of the arguments is negative, zero, or outside its nominal range.

Arguments for the [BaseAudioContext.createBuffer()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer) method.

Parameter

Type

Nullable

Optional

Description

`numberOfChannels`

unsigned long

✘

✘

Determines how many channels the buffer will have. An implementation MUST support at least 32 channels.

`length`

unsigned long

✘

✘

Determines the size of the buffer in sample-frames. This MUST be at least 1.

`sampleRate`

float

✘

✘

Describes the sample-rate of the [linear PCM](https://www.w3.org/TR/webaudio/#linear-pcm) audio data in the buffer in sample-frames per second. An implementation MUST support sample rates in at least the range 8000 to 96000.

[BaseAudioContext/createBufferSource](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBufferSource "The createBufferSource() method of the BaseAudioContext Interface is used to create a new AudioBufferSourceNode, which can be used to play audio data contained within an AudioBuffer object. AudioBuffers are created using BaseAudioContext.createBuffer or returned by BaseAudioContext.decodeAudioData when it successfully decodes an audio track.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createBufferSource()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`.

_No parameters._

[BaseAudioContext/createChannelMerger](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createChannelMerger "The createChannelMerger() method of the BaseAudioContext interface creates a ChannelMergerNode, which combines channels from multiple audio streams into a single audio stream.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createChannelMerger(numberOfInputs)`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` representing a channel merger. An `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown if `[numberOfInputs](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelmerger-numberofinputs-numberofinputs)` is less than 1 or is greater than the number of supported channels.

Arguments for the [BaseAudioContext.createChannelMerger(numberOfInputs)](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelmerger) method.

Parameter

Type

Nullable

Optional

Description

`numberOfInputs`

unsigned long

✘

✔

Determines the number of inputs. Values of up to 32 MUST be supported. If not specified, then `6` will be used.

[BaseAudioContext/createChannelSplitter](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createChannelSplitter "The createChannelSplitter() method of the BaseAudioContext Interface is used to create a ChannelSplitterNode, which is used to access the individual channels of an audio stream and process them separately.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createChannelSplitter(numberOfOutputs)`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` representing a channel splitter. An `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown if `[numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelsplitter-numberofoutputs-numberofoutputs)` is less than 1 or is greater than the number of supported channels.

[BaseAudioContext/createConstantSource](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createConstantSource "The createConstantSource() property of the BaseAudioContext interface creates a ConstantSourceNode object, which is an audio source that continuously outputs a monaural (one-channel) sound signal whose samples all have the same value.")

Firefox52+SafariNoneChrome56+

---

Opera43+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android52+iOS SafariNoneChrome for Android56+Android WebView56+Samsung Internet6.0+Opera Mobile43+

`createConstantSource()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode)`.

_No parameters._

[BaseAudioContext/createConvolver](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createConvolver "The createConvolver() method of the BaseAudioContext interface creates a ConvolverNode, which is commonly used to apply reverb effects to your audio. See the spec definition of Convolution for more information.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createConvolver()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`.

_No parameters._

[BaseAudioContext/createDelay](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDelay "The createDelay() method of the BaseAudioContext Interface is used to create a DelayNode, which is used to delay the incoming audio signal by a certain amount of time.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createDelay(maxDelayTime)`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`. The initial default delay time will be 0 seconds.

Arguments for the [BaseAudioContext.createDelay(maxDelayTime)](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdelay) method.

Parameter

Type

Nullable

Optional

Description

`maxDelayTime`

double

✘

✔

Specifies the maximum delay time in seconds allowed for the delay line. If specified, this value MUST be greater than zero and less than three minutes or a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown. If not specified, then `1` will be used.

[BaseAudioContext/createDynamicsCompressor](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createDynamicsCompressor "The createDynamicsCompressor() method of the BaseAudioContext Interface is used to create a DynamicsCompressorNode, which can be used to apply compression to an audio signal.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createDynamicsCompressor()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`.

_No parameters._

[BaseAudioContext/createGain](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createGain "The createGain() method of the BaseAudioContext interface creates a GainNode, which can be used to control the overall gain (or volume) of the audio graph.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createGain()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)`.

_No parameters._

[BaseAudioContext/createIIRFilter](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createIIRFilter "The createIIRFilter() method of the BaseAudioContext interface creates an IIRFilterNode, which represents a general infinite impulse response (IIR) filter which can be configured to serve as various types of filter.")

Firefox50+SafariNoneChrome49+

---

OperaYesEdge79+

---

Edge (Legacy)14+IENone

---

Firefox for Android50+iOS SafariNoneChrome for Android49+Android WebView49+Samsung Internet5.0+Opera MobileYes

`createIIRFilter(feedforward, feedback)`

Arguments for the [BaseAudioContext.createIIRFilter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter) method.

Parameter

Type

Nullable

Optional

Description

`feedforward`

sequence<double>

✘

✘

An array of the feedforward (numerator) coefficients for the transfer function of the IIR filter. The maximum length of this array is 20. If all of the values are zero, an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` _MUST_ be thrown. A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` _MUST_ be thrown if the array length is 0 or greater than 20.

`feedback`

sequence<double>

✘

✘

An array of the feedback (denominator) coefficients for the transfer function of the IIR filter. The maximum length of this array is 20. If the first element of the array is 0, an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` _MUST_ be thrown. A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` _MUST_ be thrown if the array length is 0 or greater than 20.

[BaseAudioContext/createOscillator](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createOscillator "The createOscillator() method of the BaseAudioContext interface creates an OscillatorNode, a source representing a periodic waveform. It basically generates a constant tone.")

In all current engines.

Firefox25+Safari6+Chrome20+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`createOscillator()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for an `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.

_No parameters._

[BaseAudioContext/createPanner](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPanner "The createPanner() method of the BaseAudioContext Interface is used to create a new PannerNode, which is used to spatialize an incoming audio stream in 3D space.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createPanner()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`.

_No parameters._

[BaseAudioContext/createPeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createPeriodicWave "The createPeriodicWave() method of the BaseAudioContext Interface is used to create a PeriodicWave, which is used to define a periodic waveform that can be used to shape the output of an OscillatorNode.")

In all current engines.

Firefox25+Safari8+Chrome59+

---

Opera17+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari8+Chrome for Android59+Android WebView59+Samsung Internet7.0+Opera Mobile18+

`createPeriodicWave(real, imag, constraints)`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) to create a `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)`.

When calling this method, execute these steps:

1.  If `[real](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-real)` and `[imag](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-imag)` are not of the same length, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` MUST be thrown.
2.  Let o be a new object of type `[PeriodicWaveOptions](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveoptions)`.
3.  Respectively set the `[real](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-real)` and `[imag](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-imag)` parameters passed to this factory method to the attributes of the same name on o.
4.  Set the `[disableNormalization](https://www.w3.org/TR/webaudio/#dom-periodicwaveconstraints-disablenormalization)` attribute on o to the value of the `[disableNormalization](https://www.w3.org/TR/webaudio/#dom-periodicwaveconstraints-disablenormalization)` attribute of the `constraints` attribute passed to the factory method.
5.  Construct a new `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` p, passing the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` this factory method has been called on as a first argument, and o.
6.  Return p.

Arguments for the [BaseAudioContext.createPeriodicWave()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave) method.

Parameter

Type

Nullable

Optional

Description

`real`

sequence<float>

✘

✘

A sequence of cosine parameters. See its `[real](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-real)` constructor argument for a more detailed description.

`imag`

sequence<float>

✘

✘

A sequence of sine parameters. See its `[imag](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-imag)` constructor argument for a more detailed description.

`constraints`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave-constraints)

PeriodicWaveConstraints

✘

✔

If not given, the waveform is normalized. Otherwise, the waveform is normalized according the value given by `constraints`.

`createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels)`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)`. This method is DEPRECATED, as it is intended to be replaced by `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`. Creates a `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` for direct audio processing using scripts. An `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown if `[bufferSize](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-buffersize)` or `[numberOfInputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofinputchannels)` or `[numberOfOutputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofoutputchannels)` are outside the valid range.

It is invalid for both `[numberOfInputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofinputchannels)` and `[numberOfOutputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofoutputchannels)` to be zero. In this case an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` MUST be thrown.

Arguments for the [BaseAudioContext.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels)](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor) method.

Parameter

Type

Nullable

Optional

Description

`bufferSize`

unsigned long

✘

✔

The `[bufferSize](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-buffersize)` parameter determines the buffer size in units of sample-frames. If it’s not passed in, or if the value is 0, then the implementation will choose the best buffer size for the given environment, which will be constant power of 2 throughout the lifetime of the node. Otherwise if the author explicitly specifies the bufferSize, it _MUST_ be one of the following values: 256, 512, 1024, 2048, 4096, 8192, 16384. This value controls how frequently the `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` event is dispatched and how many sample-frames need to be processed each call. Lower values for `[bufferSize](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-buffersize)` will result in a lower (better) [latency](https://www.w3.org/TR/webaudio/#latency). Higher values will be necessary to avoid audio breakup and [glitches](https://www.w3.org/TR/webaudio/#audio-glitching). It is recommended for authors to not specify this buffer size and allow the implementation to pick a good buffer size to balance between [latency](https://www.w3.org/TR/webaudio/#latency) and audio quality. If the value of this parameter is not one of the allowed power-of-2 values listed above, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` _MUST_ be thrown.

`numberOfInputChannels`

unsigned long

✘

✔

This parameter determines the number of channels for this node’s input. The default value is 2. Values of up to 32 must be supported. A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` must be thrown if the number of channels is not supported.

`numberOfOutputChannels`

unsigned long

✘

✔

This parameter determines the number of channels for this node’s output. The default value is 2. Values of up to 32 must be supported. A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` must be thrown if the number of channels is not supported.

[BaseAudioContext/createStereoPanner](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createStereoPanner "The createStereoPanner() method of the BaseAudioContext interface creates a StereoPannerNode, which can be used to apply stereo panning to an audio source. It positions an incoming audio stream in a stereo image using a low-cost equal-power panning algorithm.")

Firefox37+SafariNoneChrome42+

---

OperaNoneEdge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android37+iOS SafariNoneChrome for AndroidYesAndroid WebViewYesSamsung InternetYesOpera MobileNone

`createStereoPanner()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)`.

_No parameters._

[BaseAudioContext/createWaveShaper](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createWaveShaper "The createWaveShaper() method of the BaseAudioContext interface creates a WaveShaperNode, which represents a non-linear distortion. It is used to apply distortion effects to your audio.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createWaveShaper()`

[Factory method](https://www.w3.org/TR/webaudio/#factory-method) for a `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)` representing a non-linear distortion.

_No parameters._

[BaseAudioContext/decodeAudioData](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData "The decodeAudioData() method of the BaseAudioContext Interface is used to asynchronously decode audio file data contained in an ArrayBuffer. In this case the ArrayBuffer is loaded from XMLHttpRequest and FileReader. The decoded AudioBuffer is resampled to the AudioContext's sampling rate, then passed to a callback or promise.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`decodeAudioData(audioData, successCallback, errorCallback)`

Asynchronously decodes the audio file data contained in the `[ArrayBuffer](https://heycam.github.io/webidl/#idl-ArrayBuffer)`. The `[ArrayBuffer](https://heycam.github.io/webidl/#idl-ArrayBuffer)` can, for example, be loaded from an `XMLHttpRequest`’s `response` attribute after setting the `responseType` to `"arraybuffer"`. Audio file data can be in any of the formats supported by the `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` element. The buffer passed to `[decodeAudioData()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata)` has its content-type determined by sniffing, as described in [\[mimesniff\]](https://www.w3.org/TR/webaudio/#biblio-mimesniff).

Although the primary method of interfacing with this function is via its promise return value, the callback parameters are provided for legacy reasons.

When queuing a decoding operation to be performed on another thread, the following steps MUST happen on a thread that is not the [control thread](https://www.w3.org/TR/webaudio/#control-thread) nor the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread), called the `decoding thread`.

Note: Multiple `[decoding thread](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decoding-thread)`s can run in parallel to service multiple calls to `decodeAudioData`.

1.  Let can decode be a boolean flag, initially set to true.
2.  Attempt to determine the MIME type of `[audioData](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-audiodata-successcallback-errorcallback-audiodata)`, using [MIME Sniffing §6.2 Matching an audio or video type pattern](https://mimesniff.spec.whatwg.org/#matching-an-audio-or-video-type-pattern). If the audio or video type pattern matching algorithm returns `[undefined](https://heycam.github.io/webidl/#idl-undefined)`, set can decode to _false_.
3.  If can decode is _true_, attempt to decode the encoded `[audioData](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-audiodata-successcallback-errorcallback-audiodata)` into [linear PCM](https://www.w3.org/TR/webaudio/#linear-pcm). In case of failure, set can decode to _false_.
4.  If can decode is `false`, [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to execute the following steps:

    1.  Let error be a `DOMException` whose name is `[EncodingError](https://heycam.github.io/webidl/#encodingerror)`.

        2.  Reject promise with error, and remove it from `[[[pending promises]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-pending-promises-slot)`.

    2.  If `[errorCallback](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-errorcallback)` is not missing, invoke `[errorCallback](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-errorcallback)` with error.

5.  Otherwise:

    1.  Take the result, representing the decoded [linear PCM](https://www.w3.org/TR/webaudio/#linear-pcm) audio data, and resample it to the sample-rate of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` if it is different from the sample-rate of `[audioData](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-audiodata-successcallback-errorcallback-audiodata)`.
    2.  [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to execute the following steps:

        1.  Let buffer be an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` containing the final result (after possibly performing sample-rate conversion).
        2.  Resolve promise with buffer.
        3.  If `[successCallback](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-successcallback)` is not missing, invoke `[successCallback](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-successcallback)` with buffer.

Arguments for the [BaseAudioContext.decodeAudioData()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata) method.

Parameter

Type

Nullable

Optional

Description

`audioData`[](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decodeaudiodata-audiodata)

ArrayBuffer

✘

✘

An ArrayBuffer containing compressed audio data.

`successCallback`

DecodeSuccessCallback?

✔

✔

A callback function which will be invoked when the decoding is finished. The single argument to this callback is an AudioBuffer representing the decoded PCM audio data.

`errorCallback`

DecodeErrorCallback?

✔

✔

A callback function which will be invoked if there is an error decoding the audio file.

#### 1.1.3. Callback `[DecodeSuccessCallback()](https://www.w3.org/TR/webaudio/#callback-decodesuccesscallback-parameters)` Parameters[](https://www.w3.org/TR/webaudio/#callback-decodesuccesscallback-parameters)

`[decodedData](https://www.w3.org/TR/webaudio/#dom-decodesuccesscallback-decodeddata)`, of type `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`

The AudioBuffer containing the decoded audio data.

#### 1.1.4. Callback `[DecodeErrorCallback()](https://www.w3.org/TR/webaudio/#callback-decodeerrorcallback-parameters)` Parameters[](https://www.w3.org/TR/webaudio/#callback-decodeerrorcallback-parameters)

`[error](https://www.w3.org/TR/webaudio/#dom-decodeerrorcallback-error)`, of type `[DOMException](https://heycam.github.io/webidl/#idl-DOMException)`

The error that occurred while decoding.

#### 1.1.5. Lifetime[](https://www.w3.org/TR/webaudio/#lifetime-AudioContext)

Once created, an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` will continue to play sound until it has no more sound to play, or the page goes away.

#### 1.1.6. Lack of Introspection or Serialization Primitives[](https://www.w3.org/TR/webaudio/#lack-of-introspection-or-serialization-primitives)

The Web Audio API takes a _fire-and-forget_ approach to audio source scheduling. That is, [source nodes](https://www.w3.org/TR/webaudio/#audionode-source-nodes) are created for each note during the lifetime of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, and never explicitly removed from the graph. This is incompatible with a serialization API, since there is no stable set of nodes that could be serialized.

Moreover, having an introspection API would allow content script to be able to observe garbage collections.

#### 1.1.7. System Resources Associated with `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` Subclasses[](https://www.w3.org/TR/webaudio/#system-resources-associated-with-baseaudiocontext-subclasses)

The subclasses `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` and `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` should be considered expensive objects. Creating these objects may involve creating a high-priority thread, or using a low-latency system audio stream, both having an impact on energy consumption. It is usually not necessary to create more than one `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` in a document.

Constructing or resuming a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` subclass involves acquiring system resources for that context. For `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, this also requires creation of a system audio stream. These operations return when the context begins generating output from its associated audio graph.

Additionally, a user-agent can have an implementation-defined maximum number of `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`s, after which any attempt to create a new `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` will fail, throwing `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)`.

`[suspend](https://www.w3.org/TR/webaudio/#dom-audiocontext-suspend)` and `[close](https://www.w3.org/TR/webaudio/#dom-audiocontext-close)` allow authors to release system resources, including threads, processes and audio streams. Suspending a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` permits implementations to release some of its resources, and allows it to continue to operate later by invoking `[resume](https://www.w3.org/TR/webaudio/#dom-audiocontext-resume)`. Closing an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` permits implementations to release all of its resources, after which it cannot be used or resumed again.

Note: For example, this can involve waiting for the audio callbacks to fire regularly, or to wait for the hardware to be ready for processing.

### 1.2. The `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` Interface[](https://www.w3.org/TR/webaudio/#AudioContext)

[AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext "The AudioContext interface represents an audio-processing graph built from audio modules linked together, each represented by an AudioNode.")

Firefox25+SafariNoneChrome35+

---

Opera22+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariNoneChrome for Android35+Android WebView37+Samsung Internet3.0+Opera Mobile22+

This interface represents an audio graph whose `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` is routed to a real-time output device that produces a signal directed at the user. In most use cases, only a single `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is used per document.

enum `AudioContextLatencyCategory` {
["balanced"](https://www.w3.org/TR/webaudio/#dom-audiocontextlatencycategory-balanced),
["interactive"](https://www.w3.org/TR/webaudio/#dom-audiocontextlatencycategory-interactive),
["playback"](https://www.w3.org/TR/webaudio/#dom-audiocontextlatencycategory-playback)
};

Enumeration description

"`balanced`"

Balance audio output latency and power consumption.

"`interactive`"

Provide the lowest audio output latency possible without glitching. This is the default.

"`playback`"

Prioritize sustained playback without interruption over audio output latency. Lowest power consumption.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioContext` : [BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) {
[constructor](https://www.w3.org/TR/webaudio/#dom-audiocontext-audiocontext) (optional [AudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-audiocontextoptions) [contextOptions](https://www.w3.org/TR/webaudio/#dom-audiocontext-constructor-contextoptions-contextoptions) = {});
readonly attribute [double](https://heycam.github.io/webidl/#idl-double) [baseLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-baselatency);
readonly attribute [double](https://heycam.github.io/webidl/#idl-double) [outputLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-outputlatency);
[AudioTimestamp](https://www.w3.org/TR/webaudio/#dictdef-audiotimestamp) [getOutputTimestamp](https://www.w3.org/TR/webaudio/#dom-audiocontext-getoutputtimestamp) ();
[Promise](https://heycam.github.io/webidl/#idl-promise)<[undefined](https://heycam.github.io/webidl/#idl-undefined)\> [resume](https://www.w3.org/TR/webaudio/#dom-audiocontext-resume) ();
[Promise](https://heycam.github.io/webidl/#idl-promise)<[undefined](https://heycam.github.io/webidl/#idl-undefined)\> [suspend](https://www.w3.org/TR/webaudio/#dom-audiocontext-suspend) ();
[Promise](https://heycam.github.io/webidl/#idl-promise)<[undefined](https://heycam.github.io/webidl/#idl-undefined)\> [close](https://www.w3.org/TR/webaudio/#dom-audiocontext-close) ();
[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode) [createMediaElementSource](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediaelementsource) ([HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement) `mediaElement`[](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediaelementsource-mediaelement-mediaelement));
[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode) [createMediaStreamSource](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediastreamsource) ([MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream) `mediaStream`[](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediastreamsource-mediastream-mediastream));
[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode) [createMediaStreamTrackSource](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediastreamtracksource) (
[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack) `mediaStreamTrack`[](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediastreamtracksource-mediastreamtrack-mediastreamtrack));
[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode) [createMediaStreamDestination](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediastreamdestination) ();
};

An `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is said to be allowed to start if the user agent allows the context state to transition from "`[suspended](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-suspended)`" to "`[running](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-running)`". A user agent may disallow this initial transition, and to allow it only when the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s [relevant global object](https://html.spec.whatwg.org/multipage/webappapis.html#concept-relevant-global) has [sticky activation](https://html.spec.whatwg.org/multipage/interaction.html#sticky-activation).

`[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` has an internal slot:

`[[suspended by user]]`

A boolean flag representing whether the context is suspended by user code. The initial value is `false`.

#### 1.2.1. Constructors[](https://www.w3.org/TR/webaudio/#AudioContext-constructors)

[AudioContext/AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext "The AudioContext() constructor creates a new AudioContext object which represents an audio-processing graph, built from audio modules linked together, each represented by an AudioNode.")

Firefox25+SafariNoneChrome35+

---

Opera22+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariNoneChrome for Android35+Android WebView37+Samsung Internet3.0+Opera Mobile22+

`AudioContext(contextOptions)`

If the [current settings object](https://html.spec.whatwg.org/#concept-current-everything)’s [responsible document](https://html.spec.whatwg.org/#responsible-document) is NOT [fully active](https://html.spec.whatwg.org/multipage/browsers.html#fully-active), throw an `InvalidStateError` and abort these steps.

When creating an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, execute these steps:

1.  Set a `[[[control thread state]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-control-thread-state-slot)` to `suspended` on the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.
2.  Set a `[[[rendering thread state]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-rendering-thread-state-slot)` to `suspended` on the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.
3.  Let `[[pending resume promises]]` be a slot on this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, that is an initially empty ordered list of promises.
4.  If `contextOptions` is given, apply the options:

    1.  Set the internal latency of this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` according to `` contextOptions.`[latencyHint](https://www.w3.org/TR/webaudio/#dom-audiocontextoptions-latencyhint)`  ``, as described in `[latencyHint](https://www.w3.org/TR/webaudio/#dom-audiocontextoptions-latencyhint)`.
    2.  If `` contextOptions.`[sampleRate](https://www.w3.org/TR/webaudio/#dom-audiocontextoptions-samplerate)`  `` is specified, set the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` of this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` to this value. Otherwise, use the sample rate of the default output device. If the selected sample rate differs from the sample rate of the output device, this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` MUST resample the audio output to match the sample rate of the output device.

        Note: If resampling is required, the latency of the AudioContext may be affected, possibly by a large amount.

5.  If the context is [allowed to start](https://www.w3.org/TR/webaudio/#allowed-to-start), send a [control message](https://www.w3.org/TR/webaudio/#control-message) to start processing.
6.  Return this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` object.

Note: It is unfortunately not possible to programatically notify authors that the creation of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` failed. User-Agents are encouraged to log an informative message if they have access to a logging mechanism, such as a developer tools console.

#### 1.2.2. Attributes[](https://www.w3.org/TR/webaudio/#AudioContext-attributes)

[AudioContext/baseLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/baseLatency "The baseLatency read-only property of the AudioContext interface returns a double that represents the number of seconds of processing latency incurred by the AudioContext passing an audio buffer from the AudioDestinationNode — i.e. the end of the audio graph — into the host system's audio subsystem ready for playing.")

Firefox70+SafariNoneChrome58+

---

Opera45+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android58+Android WebView58+Samsung Internet7.0+Opera Mobile43+

`baseLatency`, of type [double](https://heycam.github.io/webidl/#idl-double), readonly

This represents the number of seconds of processing latency incurred by the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` passing the audio from the `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` to the audio subsystem. It does not include any additional latency that might be caused by any other processing between the output of the `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` and the audio hardware and specifically does not include any latency incurred the audio graph itself.

For example, if the audio context is running at 44.1 kHz and the `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` implements double buffering internally and can process and output audio each [render quantum](https://www.w3.org/TR/webaudio/#render-quantum), then the processing latency is (2⋅128)/44100\=5.805ms, approximately.

[AudioContext/outputLatency](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/outputLatency "The outputLatency read-only property of the AudioContext Interface provides an estimation of the output latency of the current audio context.")

In only one current engine.

Firefox70+SafariNoneChromeNone

---

OperaNoneEdgeNone

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for AndroidNoneAndroid WebViewNoneSamsung InternetNoneOpera MobileNone

`outputLatency`, of type [double](https://heycam.github.io/webidl/#idl-double), readonly

The estimation in seconds of audio output latency, i.e., the interval between the time the UA requests the host system to play a buffer and the time at which the first sample in the buffer is actually processed by the audio output device. For devices such as speakers or headphones that produce an acoustic signal, this latter time refers to the time when a sample’s sound is produced.

The `[outputLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-outputlatency)` attribute value depends on the platform and the connected hardware audio output device. The `[outputLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-outputlatency)` attribute value does not change for the context’s lifetime as long as the connected audio output device remains the same. If the audio output device is changed the `[outputLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-outputlatency)` attribute value will be updated accordingly.

#### 1.2.3. Methods[](https://www.w3.org/TR/webaudio/#AudioContext-methods)

[AudioContext/close](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/close "The close() method of the AudioContext Interface closes the audio context, releasing any system audio resources that it uses.")

In all current engines.

Firefox40+Safari9+Chrome42+

---

OperaYesEdge79+

---

Edge (Legacy)14+IENone

---

Firefox for Android40+iOS Safari9+Chrome for Android43+Android WebView43+Samsung Internet4.0+Opera MobileYes

`close()`

Closes the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, [releasing the system resources](https://www.w3.org/TR/webaudio/#releasing) being used. This will not automatically release all `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`\-created objects, but will suspend the progression of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, and stop processing audio data.

When an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is closed, any `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)`s and `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)`s that were connected to an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` will have their output ignored. That is, these will no longer cause any output to speakers or other output devices. For more flexibility in behavior, consider using [`HTMLMediaElement.captureStream()`](https://www.w3.org/TR/mediacapture-fromelement/#dom-htmlmediaelement-capturestream).

Note: When an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` has been closed, implementation can choose to aggressively release more resources than when suspending.

_No parameters._

[AudioContext/createMediaElementSource](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaElementSource "The createMediaElementSource() method of the AudioContext Interface is used to create a new MediaElementAudioSourceNode object, given an existing HTML <audio> or <video> element, the audio from which can then be played and manipulated.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createMediaElementSource(mediaElement)`

Creates a `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` given an `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)`. As a consequence of calling this method, audio playback from the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` will be re-routed into the processing graph of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

[AudioContext/createMediaStreamDestination](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamDestination "The createMediaStreamDestination() method of the AudioContext Interface is used to create a new MediaStreamAudioDestinationNode object associated with a WebRTC MediaStream representing an audio stream, which may be stored in a local file or sent to another computer.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createMediaStreamDestination()`

Creates a `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)`

_No parameters._

[AudioContext/createMediaStreamSource](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamSource "The createMediaStreamSource() method of the AudioContext Interface is used to create a new MediaStreamAudioSourceNode object, given a media stream (say, from a MediaDevices.getUserMedia instance), the audio from which can then be played and manipulated.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`createMediaStreamSource(mediaStream)`

Creates a `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)`.

[AudioContext/createMediaStreamTrackSource](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createMediaStreamTrackSource "The createMediaStreamTrackSource() method of the AudioContext interface creates and returns a MediaStreamTrackAudioSourceNode which represents an audio source whose data comes from the specified MediaStreamTrack.")

In only one current engine.

Firefox68+SafariNoneChromeNone

---

OperaNoneEdgeNone

---

Edge (Legacy)NoneIENone

---

Firefox for Android68+iOS SafariNoneChrome for AndroidNoneAndroid WebViewNoneSamsung InternetNoneOpera MobileNone

`createMediaStreamTrackSource(mediaStreamTrack)`

Creates a `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)`.

[AudioContext/getOutputTimestamp](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/getOutputTimestamp "The getOutputTimestamp() property of the AudioContext interface returns a new AudioTimestamp object containing two audio timestamp values relating to the current audio context. The getOutputTimestamp() property of the AudioContext interface returns a new AudioTimestamp object containing two audio timestamp values relating to the current audio context.")

Firefox70+SafariNoneChrome57+

---

Opera44+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android57+Android WebView57+Samsung Internet7.0+Opera Mobile43+

`getOutputTimestamp()`

Returns a new `[AudioTimestamp](https://www.w3.org/TR/webaudio/#dictdef-audiotimestamp)` instance containing two related audio stream position values for the context: the `[contextTime](https://www.w3.org/TR/webaudio/#dom-audiotimestamp-contexttime)` member contains the time of the sample frame which is currently being rendered by the audio output device (i.e., output audio stream position), in the same units and origin as context’s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`; the `[performanceTime](https://www.w3.org/TR/webaudio/#dom-audiotimestamp-performancetime)` member contains the time estimating the moment when the sample frame corresponding to the stored `contextTime` value was rendered by the audio output device, in the same units and origin as `performance.now()` (described in [\[hr-time-3\]](https://www.w3.org/TR/webaudio/#biblio-hr-time-3)).

If the context’s rendering graph has not yet processed a block of audio, then `[getOutputTimestamp](https://www.w3.org/TR/webaudio/#dom-audiocontext-getoutputtimestamp)` call returns an `[AudioTimestamp](https://www.w3.org/TR/webaudio/#dictdef-audiotimestamp)` instance with both members containing zero.

After the context’s rendering graph has started processing of blocks of audio, its `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute value always exceeds the `[contextTime](https://www.w3.org/TR/webaudio/#dom-audiotimestamp-contexttime)` value obtained from `[getOutputTimestamp](https://www.w3.org/TR/webaudio/#dom-audiocontext-getoutputtimestamp)` method call.

[](https://www.w3.org/TR/webaudio/#example-a967f6fb)The value returned from `[getOutputTimestamp](https://www.w3.org/TR/webaudio/#dom-audiocontext-getoutputtimestamp)` method can be used to get performance time estimation for the slightly later context’s time value:

function outputPerformanceTime(contextTime) {
const timestamp \= context.getOutputTimestamp();
const elapsedTime \= contextTime \- timestamp.contextTime;
return timestamp.performanceTime + elapsedTime \* 1000;
}

In the above example the accuracy of the estimation depends on how close the argument value is to the current output audio stream position: the closer the given `contextTime` is to `timestamp.contextTime`, the better the accuracy of the obtained estimation.

Note: The difference between the values of the context’s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` and the `[contextTime](https://www.w3.org/TR/webaudio/#dom-audiotimestamp-contexttime)` obtained from `[getOutputTimestamp](https://www.w3.org/TR/webaudio/#dom-audiocontext-getoutputtimestamp)` method call cannot be considered as a reliable output latency estimation because `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` may be incremented at non-uniform time intervals, so `[outputLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-outputlatency)` attribute should be used instead.

_No parameters._

[AudioContext/resume](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/resume "The resume() method of the AudioContext interface resumes the progression of time in an audio context that has previously been suspended.")

In all current engines.

Firefox40+Safari9+Chrome41+

---

OperaYesEdge79+

---

Edge (Legacy)14+IENone

---

Firefox for AndroidYesiOS Safari9+Chrome for Android41+Android WebView41+Samsung Internet4.0+Opera MobileYes

`resume()`

Resumes the progression of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` when it has been suspended.

Running a [control message](https://www.w3.org/TR/webaudio/#control-message) to resume an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` means running these steps on the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread):

1.  Attempt to [acquire system resources](https://www.w3.org/TR/webaudio/#acquiring).
2.  Set the `[[[rendering thread state]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-rendering-thread-state-slot)` on the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` to `running`.
3.  Start [rendering the audio graph](https://www.w3.org/TR/webaudio/#rendering-loop).
4.  In case of failure, [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to execute the following steps:

    1.  Reject all promises from `[[[pending resume promises]]](https://www.w3.org/TR/webaudio/#dom-audiocontext-pending-resume-promises-slot)` in order, then clear `[[[pending resume promises]]](https://www.w3.org/TR/webaudio/#dom-audiocontext-pending-resume-promises-slot)`.
    2.  Additionally, remove those promises from `[[[pending promises]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-pending-promises-slot)`.

5.  [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to execute the following steps:

    1.  Resolve all promises from `[[[pending resume promises]]](https://www.w3.org/TR/webaudio/#dom-audiocontext-pending-resume-promises-slot)` in order.
    2.  Clear `[[[pending resume promises]]](https://www.w3.org/TR/webaudio/#dom-audiocontext-pending-resume-promises-slot)`. Additionally, remove those promises from `[[[pending promises]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-pending-promises-slot)`.
    3.  Resolve _promise_.
    4.  If the `[state](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-state)` attribute of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is not already "`[running](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-running)`":

        1.  Set the `[state](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-state)` attribute of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` to "`[running](https://www.w3.org/TR/webaudio/#dom-audiocontextstate-running)`".
        2.  [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to [fire an event](https://dom.spec.whatwg.org/#concept-event-fire) named `statechange` at the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

_No parameters._

[AudioContext/suspend](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/suspend "The suspend() method of the AudioContext Interface suspends the progression of time in the audio context, temporarily halting audio hardware access and reducing CPU/battery usage in the process — this is useful if you want an application to power down the audio hardware when it will not be using an audio context for a while.")

In all current engines.

Firefox40+Safari9+Chrome43+

---

OperaYesEdge79+

---

Edge (Legacy)14+IENone

---

Firefox for Android40+iOS Safari9+Chrome for Android43+Android WebView43+Samsung Internet4.0+Opera MobileYes

`suspend()`

Suspends the progression of `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, allows any current context processing blocks that are already processed to be played to the destination, and then allows the system to release its claim on audio hardware. This is generally useful when the application knows it will not need the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` for some time, and wishes to temporarily [release system resource](https://www.w3.org/TR/webaudio/#releasing) associated with the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`. The promise resolves when the frame buffer is empty (has been handed off to the hardware), or immediately (with no other effect) if the context is already `suspended`. The promise is rejected if the context has been closed.

While an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is suspended, `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)`s will have their output ignored; that is, data will be lost by the real time nature of media streams. `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)`s will similarly have their output ignored until the system is resumed. `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`s and `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)`s will cease to have their processing handlers invoked while suspended, but will resume when the context is resumed. For the purpose of `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` window functions, the data is considered as a continuous stream - i.e. the `resume()`/`suspend()` does not cause silence to appear in the `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)`'s stream of data. In particular, calling `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` functions repeatedly when a `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is suspended MUST return the same data.

_No parameters._

#### 1.2.4. `[AudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-audiocontextoptions)`[](https://www.w3.org/TR/webaudio/#AudioContextOptions)

[AudioContextOptions](https://developer.mozilla.org/en-US/docs/Web/API/AudioContextOptions "The AudioContextOptions dictionary is used to specify configuration options when constructing a new AudioContext object to represent a graph of web audio nodes.")

Firefox61+SafariNoneChrome60+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android61+iOS SafariNoneChrome for Android60+Android WebView60+Samsung Internet8.0+Opera Mobile?

The `[AudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-audiocontextoptions)` dictionary is used to specify user-specified options for an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

dictionary `AudioContextOptions` {
([AudioContextLatencyCategory](https://www.w3.org/TR/webaudio/#enumdef-audiocontextlatencycategory) or [double](https://heycam.github.io/webidl/#idl-double)) [latencyHint](https://www.w3.org/TR/webaudio/#dom-audiocontextoptions-latencyhint) = "interactive";
[float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-audiocontextoptions-samplerate);
};

##### 1.2.4.1. Dictionary `[AudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-audiocontextoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audiocontextoptions-members)

[AudioContextOptions/latencyHint](https://developer.mozilla.org/en-US/docs/Web/API/AudioContextOptions/latencyHint "The AudioContextOptions dictionary (used when instantiating an AudioContext) may contain a property named latencyHint, which indicates the preferred maximum latency in seconds for the audio context.")

Firefox61+SafariNoneChrome60+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android61+iOS SafariNoneChrome for Android60+Android WebView60+Samsung Internet8.0+Opera Mobile?

`latencyHint`, of type `(AudioContextLatencyCategory or double)`, defaulting to `"interactive"`

Identify the type of playback, which affects tradeoffs between audio output latency and power consumption.

The preferred value of the `latencyHint` is a value from `[AudioContextLatencyCategory](https://www.w3.org/TR/webaudio/#enumdef-audiocontextlatencycategory)`. However, a double can also be specified for the number of seconds of latency for finer control to balance latency and power consumption. It is at the browser’s discretion to interpret the number appropriately. The actual latency used is given by AudioContext’s `[baseLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-baselatency)` attribute.

[AudioContextOptions/sampleRate](https://developer.mozilla.org/en-US/docs/Web/API/AudioContextOptions/sampleRate "The AudioContextOptions dictionary (used when instantiating an AudioContext) may contain a property named sampleRate, which indicates the sample rate to use for the new context.")

Firefox61+SafariNoneChrome74+

---

OperaNoneEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android61+iOS SafariNoneChrome for Android74+Android WebView74+Samsung Internet11.0+Opera Mobile?

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float)

Set the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` to this value for the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` that will be created. The supported values are the same as the sample rates for an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`. A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown if the specified sample rate is not supported.

If `[sampleRate](https://www.w3.org/TR/webaudio/#dom-audiocontextoptions-samplerate)` is not specified, the preferred sample rate of the output device for this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is used.

#### 1.2.5. `[AudioTimestamp](https://www.w3.org/TR/webaudio/#dictdef-audiotimestamp)`[](https://www.w3.org/TR/webaudio/#AudioTimestamp)

dictionary `AudioTimestamp` {
[double](https://heycam.github.io/webidl/#idl-double) [contextTime](https://www.w3.org/TR/webaudio/#dom-audiotimestamp-contexttime);
[DOMHighResTimeStamp](https://www.w3.org/TR/hr-time-3/#dom-domhighrestimestamp) [performanceTime](https://www.w3.org/TR/webaudio/#dom-audiotimestamp-performancetime);
};

##### 1.2.5.1. Dictionary `[AudioTimestamp](https://www.w3.org/TR/webaudio/#dictdef-audiotimestamp)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audiotimestamp-members)

`contextTime`, of type [double](https://heycam.github.io/webidl/#idl-double)

Represents a point in the time coordinate system of BaseAudioContext’s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

`performanceTime`, of type [DOMHighResTimeStamp](https://www.w3.org/TR/hr-time-3/#dom-domhighrestimestamp)

Represents a point in the time coordinate system of a `Performance` interface implementation (described in [\[hr-time-3\]](https://www.w3.org/TR/webaudio/#biblio-hr-time-3)).

### 1.3. The `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` Interface[](https://www.w3.org/TR/webaudio/#OfflineAudioContext)

[OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext "The OfflineAudioContext interface is an AudioContext interface representing an audio-processing graph built from linked together AudioNodes. In contrast with a standard AudioContext, an OfflineAudioContext doesn't render the audio to the device hardware; instead, it generates it, as fast as it can, and outputs the result to an AudioBuffer.")

Firefox25+SafariNoneChrome35+

---

Opera22+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariNoneChrome for Android35+Android WebView4.4.3+Samsung Internet3.0+Opera Mobile22+

`[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` is a particular type of `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` for rendering/mixing-down (potentially) faster than real-time. It does not render to the audio hardware, but instead renders as quickly as possible, fulfilling the returned promise with the rendered result as an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `OfflineAudioContext` : [BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) {
[constructor](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-offlineaudiocontext)([OfflineAudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-offlineaudiocontextoptions) [contextOptions](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-constructor-contextoptions-contextoptions));
[constructor](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-offlineaudiocontext-numberofchannels-length-samplerate)([unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfChannels](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-constructor-numberofchannels-length-samplerate-numberofchannels), [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [length](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-constructor-numberofchannels-length-samplerate-length), [float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-constructor-numberofchannels-length-samplerate-samplerate));
[Promise](https://heycam.github.io/webidl/#idl-promise)<[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)\> [startRendering](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-startrendering)();
[Promise](https://heycam.github.io/webidl/#idl-promise)<[undefined](https://heycam.github.io/webidl/#idl-undefined)\> [resume](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-resume)();
[Promise](https://heycam.github.io/webidl/#idl-promise)<[undefined](https://heycam.github.io/webidl/#idl-undefined)\> [suspend](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-suspend)([double](https://heycam.github.io/webidl/#idl-double) `suspendTime`[](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-suspend-suspendtime-suspendtime));
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [length](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-length);
attribute [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler) [oncomplete](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-oncomplete);
};

#### 1.3.1. Constructors[](https://www.w3.org/TR/webaudio/#OfflineAudioContext-constructors)

[OfflineAudioContext/OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/OfflineAudioContext "The OfflineAudioContext() constructor—part of the Web Audio API—creates and returns a new OfflineAudioContext object instance, which can then be used to render audio to an AudioBuffer rather than to an audio output device. The OfflineAudioContext() constructor—part of the Web Audio API—creates and returns a new OfflineAudioContext object instance, which can then be used to render audio to an AudioBuffer rather than to an audio output device.")

Firefox53+SafariNoneChrome35+

---

Opera22+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android35+Android WebView4.4.3+Samsung Internet3.0+Opera Mobile22+

`OfflineAudioContext(contextOptions)`

`OfflineAudioContext(numberOfChannels, length, sampleRate)`

The `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` can be constructed with the same arguments as AudioContext.createBuffer. A `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown if any of the arguments is negative, zero, or outside its nominal range.

The OfflineAudioContext is constructed as if

new OfflineAudioContext({
numberOfChannels: numberOfChannels,
length: length,
sampleRate: sampleRate
})

were called instead.

#### 1.3.2. Attributes[](https://www.w3.org/TR/webaudio/#OfflineAudioContext-attributes)

[OfflineAudioContext/length](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/length "The length property of the OfflineAudioContext interface returns an integer representing the size of the buffer in sample-frames.")

FirefoxYesSafariNoneChrome51+

---

Opera38+Edge79+

---

Edge (Legacy)14+IENone

---

Firefox for AndroidYesiOS SafariNoneChrome for Android51+Android WebView51+Samsung Internet5.0+Opera Mobile41+

`length`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

The size of the buffer in sample-frames. This is the same as the value of the `length` parameter for the constructor.

[OfflineAudioContext/oncomplete](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/oncomplete "The oncomplete event handler of the OfflineAudioContext interface is called when the audio processing is terminated, that is when the complete event (of type OfflineAudioCompletionEvent) is raised.")

In all current engines.

Firefox25+Safari6+Chrome25+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari?Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`oncomplete`, of type [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)

An EventHandler of type [OfflineAudioCompletionEvent](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEvent). It is the last event fired on an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

#### 1.3.3. Methods[](https://www.w3.org/TR/webaudio/#OfflineAudioContext-methods)

[OfflineAudioContext/startRendering](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/startRendering "The startRendering() method of the OfflineAudioContext Interface starts rendering the audio graph, taking into account the current connections and the current scheduled changes.")

In all current engines.

Firefox25+Safari6+Chrome25+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari?Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`startRendering()`

Given the current connections and scheduled changes, starts rendering audio.

Although the primary method of getting the rendered audio data is via its promise return value, the instance will also fire an event named `complete` for legacy reasons.

_No parameters._

[OfflineAudioContext/resume](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/resume "The resume() method of the OfflineAudioContext interface resumes the progression of time in an audio context that has been suspended. The promise resolves immediately because the OfflineAudioContext does not require the audio hardware. If the context is not currently suspended or the rendering has not started, the promise is rejected with InvalidStateError.")

In only one current engine.

FirefoxNoneSafariNoneChrome49+

---

Opera36+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android49+Android WebView49+Samsung Internet5.0+Opera Mobile36+

`resume()`

Resumes the progression of the `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` when it has been suspended.

_No parameters._

[OfflineAudioContext/suspend](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/suspend "The suspend() method of the OfflineAudioContext interface schedules a suspension of the time progression in the audio context at the specified time and returns a promise. This is generally useful at the time of manipulating the audio graph synchronously on OfflineAudioContext.")

In only one current engine.

FirefoxNoneSafariNoneChrome49+

---

Opera36+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android49+Android WebView49+Samsung Internet5.0+Opera Mobile36+

`suspend(suspendTime)`

Schedules a suspension of the time progression in the audio context at the specified time and returns a promise. This is generally useful when manipulating the audio graph synchronously on `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

Note that the maximum precision of suspension is the size of the [render quantum](https://www.w3.org/TR/webaudio/#render-quantum) and the specified suspension time will be rounded up to the nearest [render quantum](https://www.w3.org/TR/webaudio/#render-quantum) boundary. For this reason, it is not allowed to schedule multiple suspends at the same quantized frame. Also, scheduling should be done while the context is not running to ensure precise suspension.

Arguments for the [OfflineAudioContext.suspend()](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-suspend) method.

Parameter

Type

Nullable

Optional

Description

`suspendTime`[](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontext-suspend-suspendtime)

double

✘

✘

Schedules a suspension of the rendering at the specified time, which is quantized and rounded up to the [render quantum](https://www.w3.org/TR/webaudio/#render-quantum) size. If the quantized frame number

1.  is negative or
2.  is less than or equal to the current time or
3.  is greater than or equal to the total render duration or
4.  is scheduled by another suspend for the same time,

then the promise is rejected with `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)`.

#### 1.3.4. `[OfflineAudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-offlineaudiocontextoptions)`[](https://www.w3.org/TR/webaudio/#OfflineAudioContextOptions)

This specifies the options to use in constructing an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

dictionary `OfflineAudioContextOptions` {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfChannels](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontextoptions-numberofchannels) = 1;
required [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [length](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontextoptions-length);
required [float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-offlineaudiocontextoptions-samplerate);
};

##### 1.3.4.1. Dictionary `[OfflineAudioContextOptions](https://www.w3.org/TR/webaudio/#dictdef-offlineaudiocontextoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-offlineaudiocontextoptions-members)

`length`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long)

The length of the rendered `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` in sample-frames.

`numberOfChannels`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `1`

The number of channels for this `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float)

The sample rate for this `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

#### 1.3.5. The `[OfflineAudioCompletionEvent](https://www.w3.org/TR/webaudio/#offlineaudiocompletionevent)` Interface[](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEvent)

[OfflineAudioCompletionEvent](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioCompletionEvent "The Web Audio API OfflineAudioCompletionEvent interface represents events that occur when the processing of an OfflineAudioContext is terminated. The complete event implements this interface.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

[OfflineAudioContext/complete_event](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext/complete_event "The complete event of the OfflineAudioContext interface is fired when the rendering of an offline audio context is complete.")

In all current engines.

Firefox25+Safari6+Chrome25+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari?Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

This is an `[Event](https://dom.spec.whatwg.org/#event)` object which is dispatched to `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` for legacy reasons.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `OfflineAudioCompletionEvent` : [Event](https://dom.spec.whatwg.org/#event) {
`constructor`[](https://www.w3.org/TR/webaudio/#dom-offlineaudiocompletionevent-offlineaudiocompletionevent) ([DOMString](https://heycam.github.io/webidl/#idl-DOMString) `type`[](https://www.w3.org/TR/webaudio/#dom-offlineaudiocompletionevent-offlineaudiocompletionevent-type-eventinitdict-type), [OfflineAudioCompletionEventInit](https://www.w3.org/TR/webaudio/#dictdef-offlineaudiocompletioneventinit) `eventInitDict`[](https://www.w3.org/TR/webaudio/#dom-offlineaudiocompletionevent-offlineaudiocompletionevent-type-eventinitdict-eventinitdict));
readonly attribute [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [renderedBuffer](https://www.w3.org/TR/webaudio/#dom-offlineaudiocompletionevent-renderedbuffer);
};

##### 1.3.5.1. Attributes[](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEvent-attributes)

[OfflineAudioCompletionEvent/renderedBuffer](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioCompletionEvent/renderedBuffer "The renderedBuffer read-only property of the OfflineAudioCompletionEvent interface is an AudioBuffer containing the result of processing an OfflineAudioContext.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`renderedBuffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), readonly

An `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` containing the rendered audio data.

##### 1.3.5.2. `[OfflineAudioCompletionEventInit](https://www.w3.org/TR/webaudio/#dictdef-offlineaudiocompletioneventinit)`[](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEventInit)

dictionary `OfflineAudioCompletionEventInit` : [EventInit](https://dom.spec.whatwg.org/#dictdef-eventinit) {
required [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [renderedBuffer](https://www.w3.org/TR/webaudio/#dom-offlineaudiocompletioneventinit-renderedbuffer);
};

###### 1.3.5.2.1. Dictionary `[OfflineAudioCompletionEventInit](https://www.w3.org/TR/webaudio/#dictdef-offlineaudiocompletioneventinit)` Members[](https://www.w3.org/TR/webaudio/#dictionary-offlineaudiocompletioneventinit-members)

`renderedBuffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)

Value to be assigned to the `[renderedBuffer](https://www.w3.org/TR/webaudio/#dom-offlineaudiocompletionevent-renderedbuffer)` attribute of the event.

### 1.4. The `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` Interface[](https://www.w3.org/TR/webaudio/#AudioBuffer)

[AudioBuffer/AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/AudioBuffer "The AudioBuffer constructor of the Web Audio API creates a new AudioBuffer object.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

This interface represents a memory-resident audio asset. It can contain one or more channels with each channel appearing to be 32-bit floating-point [linear PCM](https://www.w3.org/TR/webaudio/#linear-pcm) values with a nominal range of \[−1,1\] but the values are not limited to this range. Typically, it would be expected that the length of the PCM data would be fairly short (usually somewhat less than a minute). For longer sounds, such as music soundtracks, streaming should be used with the `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` element and `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`.

An `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` may be used by one or more `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`s, and can be shared between an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` and an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

`[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` has four internal slots:

`[[number of channels]]`

The number of audio channels for this `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, which is an unsigned long.

`[[length]]`

The length of each channel of this `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, which is an unsigned long.

`[[sample rate]]`

The sample-rate, in Hz, of this `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, a float.

`[[internal data]]`

A [data block](https://tc39.github.io/ecma262/#sec-data-blocks) holding the audio sample data.

[AudioBuffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer "The AudioBuffer interface represents a short audio asset residing in memory, created from an audio file using the AudioContext.decodeAudioData() method, or from raw data using AudioContext.createBuffer(). Once put into an AudioBuffer, the audio can then be played by being passed into an AudioBufferSourceNode.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioBuffer` {
[constructor](https://www.w3.org/TR/webaudio/#dom-audiobuffer-audiobuffer) ([AudioBufferOptions](https://www.w3.org/TR/webaudio/#dictdef-audiobufferoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-audiobuffer-options-options));
readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-audiobuffer-samplerate);
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [length](https://www.w3.org/TR/webaudio/#dom-audiobuffer-length);
readonly attribute [double](https://heycam.github.io/webidl/#idl-double) [duration](https://www.w3.org/TR/webaudio/#dom-audiobuffer-duration);
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfChannels](https://www.w3.org/TR/webaudio/#dom-audiobuffer-numberofchannels);
[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) [getChannelData](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata) ([unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `channel`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata-channel-channel));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [copyFromChannel](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel) ([Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `destination`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination-channelnumber-bufferoffset-destination),
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `channelNumber`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination-channelnumber-bufferoffset-channelnumber),
optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `bufferOffset`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination-channelnumber-bufferoffset-bufferoffset) = 0);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [copyToChannel](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel) ([Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `source`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source-channelnumber-bufferoffset-source),
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `channelNumber`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source-channelnumber-bufferoffset-channelnumber),
optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) `bufferOffset`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source-channelnumber-bufferoffset-bufferoffset) = 0);
};

#### 1.4.1. Constructors[](https://www.w3.org/TR/webaudio/#AudioBuffer-constructors)

`AudioBuffer(options)`

#### 1.4.2. Attributes[](https://www.w3.org/TR/webaudio/#AudioBuffer-attributes)

[AudioBuffer/duration](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/duration "The duration property of the AudioBuffer interface returns a double representing the duration, in seconds, of the PCM data stored in the buffer.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`duration`, of type [double](https://heycam.github.io/webidl/#idl-double), readonly

Duration of the PCM audio data in seconds.

This is computed from the `[[[sample rate]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-sample-rate-slot)` and the `[[[length]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-length-slot)` of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` by performing a division between the `[[[length]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-length-slot)` and the `[[[sample rate]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-sample-rate-slot)`.

[AudioBuffer/length](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/length "The length property of the AudioBuffer interface returns an integer representing the length, in sample-frames, of the PCM data stored in the buffer.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`length`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

Length of the PCM audio data in sample-frames. This MUST return the value of `[[[length]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-length-slot)`.

[AudioBuffer/numberOfChannels](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/numberOfChannels "The numberOfChannels property of the AudioBuffer interface returns an integer representing the number of discrete audio channels described by the PCM data stored in the buffer.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`numberOfChannels`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

The number of discrete audio channels. This MUST return the value of `[[[number of channels]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-number-of-channels-slot)`.

[AudioBuffer/sampleRate](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/sampleRate "The sampleRate property of the AudioBuffer interface returns a float representing the sample rate, in samples per second, of the PCM data stored in the buffer.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

The sample-rate for the PCM audio data in samples per second. This MUST return the value of `[[[sample rate]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-sample-rate-slot)`.

#### 1.4.3. Methods[](https://www.w3.org/TR/webaudio/#AudioBuffer-methods)

[AudioBuffer/copyFromChannel](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/copyFromChannel "The copyFromChannel() method of the AudioBuffer interface copies the audio sample data from the specified channel of the AudioBuffer to a specified Float32Array.The copyFromChannel() method of the AudioBuffer interface copies the audio sample data from the specified channel of the AudioBuffer to a specified Float32Array.")

Firefox25+SafariNoneChrome43+

---

Opera30+Edge79+

---

Edge (Legacy)13+IENone

---

Firefox for Android25+iOS SafariNoneChrome for Android43+Android WebView43+Samsung Internet4.0+Opera Mobile30+

`copyFromChannel(destination, channelNumber, bufferOffset)`

The `[copyFromChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel)` method copies the samples from the specified channel of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` to the `destination` array.

Let `buffer` be the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` with Nb frames, let Nf be the number of elements in the `[destination](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination)` array, and k be the value of `[bufferOffset](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-bufferoffset)`. Then the number of frames copied from `buffer` to `[destination](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination)` is max(0,min(Nb−k,Nf)). If this is less than Nf, then the remaining elements of `[destination](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination)` are not modified.

Arguments for the [AudioBuffer.copyFromChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel) method.

Parameter

Type

Nullable

Optional

Description

`destination`

Float32Array

✘

✘

The array the channel data will be copied to.

`channelNumber`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-channelnumber)

unsigned long

✘

✘

The index of the channel to copy the data from. If `channelNumber` is greater or equal than the number of channels of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` MUST be thrown.

`bufferOffset`

unsigned long

✘

✔

An optional offset, defaulting to 0. Data from the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` starting at this offset is copied to the `[destination](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel-destination)`.

[AudioBuffer/copyToChannel](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/copyToChannel "The copyToChannel() method of the AudioBuffer interface copies the samples to the specified channel of the AudioBuffer, from the source array.")

Firefox25+SafariNoneChrome43+

---

Opera30+Edge79+

---

Edge (Legacy)13+IENone

---

Firefox for Android25+iOS SafariNoneChrome for Android43+Android WebView43+Samsung Internet4.0+Opera Mobile30+

`copyToChannel(source, channelNumber, bufferOffset)`

The `[copyToChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel)` method copies the samples to the specified channel of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` from the `source` array.

A `[UnknownError](https://heycam.github.io/webidl/#unknownerror)` may be thrown if `[source](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source)` cannot be copied to the buffer.

Let `buffer` be the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` with Nb frames, let Nf be the number of elements in the `[source](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source)` array, and k be the value of `[bufferOffset](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-bufferoffset)`. Then the number of frames copied from `[source](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source)` to the `buffer` is max(0,min(Nb−k,Nf)). If this is less than Nf, then the remaining elements of `buffer` are not modified.

Arguments for the [AudioBuffer.copyToChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel) method.

Parameter

Type

Nullable

Optional

Description

`source`

Float32Array

✘

✘

The array the channel data will be copied from.

`channelNumber`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-channelnumber)

unsigned long

✘

✘

The index of the channel to copy the data to. If `channelNumber` is greater or equal than the number of channels of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` MUST be thrown.

`bufferOffset`

unsigned long

✘

✔

An optional offset, defaulting to 0. Data from the `[source](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel-source)` is copied to the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` starting at this offset.

[AudioBuffer/getChannelData](https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer/getChannelData "The getChannelData() method of the AudioBuffer Interface returns a Float32Array containing the PCM data associated with the channel, defined by the channel parameter (with 0 representing the first channel).")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`getChannelData(channel)`

According to the rules described in [acquire the content](https://www.w3.org/TR/webaudio/#acquire-the-content) either [get a reference to](https://heycam.github.io/webidl/#dfn-get-buffer-source-reference) or [get a copy of](https://heycam.github.io/webidl/#dfn-get-buffer-source-copy) the bytes stored in `[[[internal data]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-internal-data-slot)` in a new `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`

A `[UnknownError](https://heycam.github.io/webidl/#unknownerror)` may be thrown if the `[[[internal data]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-internal-data-slot)` or the new `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` cannot be created.

Arguments for the [AudioBuffer.getChannelData()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata) method.

Parameter

Type

Nullable

Optional

Description

`channel`[](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata-channel)

unsigned long

✘

✘

This parameter is an index representing the particular channel to get data for. An index value of 0 represents the first channel. This index value MUST be less than `[[[number of channels]]](https://www.w3.org/TR/webaudio/#dom-audiobuffer-number-of-channels-slot)` or an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

Note: The methods `[copyToChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel)` and `[copyFromChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel)` can be used to fill part of an array by passing in a `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` that’s a view onto the larger array. When reading data from an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`'s channels, and the data can be processed in chunks, `[copyFromChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copyfromchannel)` should be preferred to calling `[getChannelData()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata)` and accessing the resulting array, because it may avoid unnecessary memory allocation and copying.

An internal operation [acquire the contents of an AudioBuffer](https://www.w3.org/TR/webaudio/#acquire-the-content) is invoked when the contents of an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` are needed by some API implementation. This operation returns immutable channel data to the invoker.

The [acquire the contents of an AudioBuffer](https://www.w3.org/TR/webaudio/#acquire-the-content) operation is invoked in the following cases:

- When `[AudioBufferSourceNode.start](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start)` is called, it [acquires the contents](https://www.w3.org/TR/webaudio/#acquire-the-content) of the node’s `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)`. If the operation fails, nothing is played.
- When the `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` of an `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` is set and `[AudioBufferSourceNode.start](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start)` has been previously called, the setter [acquires the content](https://www.w3.org/TR/webaudio/#acquire-the-content) of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`. If the operation fails, nothing is played.
- When a `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`'s `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` is set to an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` it [acquires the content](https://www.w3.org/TR/webaudio/#acquire-the-content) of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`.
- When the dispatch of an `[AudioProcessingEvent](https://www.w3.org/TR/webaudio/#audioprocessingevent)` completes, it [acquires the contents](https://www.w3.org/TR/webaudio/#acquire-the-content) of its `[outputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-outputbuffer)`.

Note: This means that `[copyToChannel()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-copytochannel)` cannot be used to change the content of an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` currently in use by an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` that has [acquired the content of an AudioBuffer](https://www.w3.org/TR/webaudio/#acquire-the-content) since the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` will continue to use the data previously acquired.

#### 1.4.4. `[AudioBufferOptions](https://www.w3.org/TR/webaudio/#dictdef-audiobufferoptions)`[](https://www.w3.org/TR/webaudio/#AudioBufferOptions)

This specifies the options to use in constructing an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`. The `[length](https://www.w3.org/TR/webaudio/#dom-audiobufferoptions-length)` and `[sampleRate](https://www.w3.org/TR/webaudio/#dom-audiobufferoptions-samplerate)` members are required.

dictionary `AudioBufferOptions` {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfChannels](https://www.w3.org/TR/webaudio/#dom-audiobufferoptions-numberofchannels) = 1;
required [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [length](https://www.w3.org/TR/webaudio/#dom-audiobufferoptions-length);
required [float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-audiobufferoptions-samplerate);
};

##### 1.4.4.1. Dictionary `[AudioBufferOptions](https://www.w3.org/TR/webaudio/#dictdef-audiobufferoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audiobufferoptions-members)

The allowed values for the members of this dictionary are constrained. See `[createBuffer()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer)`.

`length`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long)

The length in sample frames of the buffer. See `[length](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer-length)` for constraints.

`numberOfChannels`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `1`

The number of channels for the buffer. See `[numberOfChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer-numberofchannels)` for constraints.

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float)

The sample rate in Hz for the buffer. See `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createbuffer-samplerate)` for constraints.

### 1.5. The `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` Interface[](https://www.w3.org/TR/webaudio/#AudioNode)

`[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s are the building blocks of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`. This interface represents audio sources, the audio destination, and intermediate processing modules. These modules can be connected together to form [processing graphs](https://www.w3.org/TR/webaudio/#ModularRouting) for rendering audio to the audio hardware. Each node can have [inputs](https://www.w3.org/TR/webaudio/#inputs) and/or [outputs](https://www.w3.org/TR/webaudio/#outputs). A [source node](https://www.w3.org/TR/webaudio/#source-node) has no inputs and a single output. Most processing nodes such as filters will have one input and one output. Each type of `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` differs in the details of how it processes or synthesizes audio. But, in general, an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` will process its inputs (if it has any), and generate audio for its outputs (if it has any).

Each output has one or more channels. The exact number of channels depends on the details of the specific `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

An output may connect to one or more `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` inputs, thus _fan-out_ is supported. An input initially has no connections, but may be connected from one or more `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` outputs, thus _fan-in_ is supported. When the `connect()` method is called to connect an output of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to an input of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, we call that a connection to the input.

Each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` input has a specific number of channels at any given time. This number can change depending on the [connection](https://www.w3.org/TR/webaudio/#connection)(s) made to the input. If the input has no connections then it has one channel which is silent.

For each [input](https://www.w3.org/TR/webaudio/#input), an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` performs a mixing of all connections to that input. Please see [§ 4 Channel Up-Mixing and Down-Mixing](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) for normative requirements and details.

The processing of inputs and the internal operations of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` take place continuously with respect to `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` time, regardless of whether the node has connected outputs, and regardless of whether these outputs ultimately reach an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)`.

[AudioNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode "The AudioNode interface is a generic interface for representing an audio processing module.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioNode` : [EventTarget](https://dom.spec.whatwg.org/#eventtarget) {
[AudioNode](https://www.w3.org/TR/webaudio/#audionode) [connect](https://www.w3.org/TR/webaudio/#dom-audionode-connect) ([AudioNode](https://www.w3.org/TR/webaudio/#audionode) [destinationNode](https://www.w3.org/TR/webaudio/#dom-audionode-connect-destinationnode-output-input-destinationnode),
optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [output](https://www.w3.org/TR/webaudio/#dom-audionode-connect-destinationnode-output-input-output) = 0,
optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [input](https://www.w3.org/TR/webaudio/#dom-audionode-connect-destinationnode-output-input-input) = 0);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [connect](https://www.w3.org/TR/webaudio/#dom-audionode-connect-destinationparam-output) ([AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [destinationParam](https://www.w3.org/TR/webaudio/#dom-audionode-connect-destinationparam-output-destinationparam), optional [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [output](https://www.w3.org/TR/webaudio/#dom-audionode-connect-destinationparam-output-output) = 0);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect) ();
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-output) ([unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [output](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-output-output));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode) ([AudioNode](https://www.w3.org/TR/webaudio/#audionode) [destinationNode](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-destinationnode));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output) ([AudioNode](https://www.w3.org/TR/webaudio/#audionode) [destinationNode](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-destinationnode), [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [output](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-output));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-input) ([AudioNode](https://www.w3.org/TR/webaudio/#audionode) [destinationNode](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-input-destinationnode),
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [output](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-input-output),
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [input](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-input-input));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationparam) ([AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [destinationParam](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationparam-destinationparam));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [disconnect](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationparam-output) ([AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [destinationParam](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationparam-output-destinationparam), [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [output](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationparam-output-output));
readonly attribute [BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) [context](https://www.w3.org/TR/webaudio/#dom-audionode-context);
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfInputs](https://www.w3.org/TR/webaudio/#dom-audionode-numberofinputs);
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-audionode-numberofoutputs);
attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount);
attribute [ChannelCountMode](https://www.w3.org/TR/webaudio/#enumdef-channelcountmode) [channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionode-channelcountmode);
attribute [ChannelInterpretation](https://www.w3.org/TR/webaudio/#enumdef-channelinterpretation) [channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation);
};

#### 1.5.1. AudioNode Creation[](https://www.w3.org/TR/webaudio/#AudioNode-creation)

`[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s can be created in two ways: by using the constructor for this particular interface, or by using the factory method on the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` or `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

The `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` passed as first argument of the constructor of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s is called the associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to be created. Similarly, when using the factory method, the [associated `BaseAudioContext`](https://www.w3.org/TR/webaudio/#associated) of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` is the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` this factory method is called on.

To create a new `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` of a particular type n using its [factory method](https://www.w3.org/TR/webaudio/#factory-method), called on a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c, execute these steps:

1.  Let node be a new object of type n.
2.  Let option be a dictionary of the type [associated](https://www.w3.org/TR/webaudio/#associated-option-object) to the interface [associated](https://www.w3.org/TR/webaudio/#associated-interface) to this factory method.
3.  For each parameter passed to the factory method, set the dictionary member of the same name on option to the value of this parameter.
4.  Call the constructor for n on node with c and option as arguments.
5.  Return node

Initializing an object o that inherits from `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` means executing the following steps, given the arguments context and dict passed to the constructor of this interface.

1.  Set o’s associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` to context.
2.  Set its value for `[numberOfInputs](https://www.w3.org/TR/webaudio/#dom-audionode-numberofinputs)`, `[numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-audionode-numberofoutputs)`, `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)`, `[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionode-channelcountmode)`, `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` to the default value for this specific interface outlined in the section for each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.
3.  For each member of dict passed in, execute these steps, with k the key of the member, and v its value. If any exceptions is thrown when executing these steps, abort the iteration and propagate the exception to the caller of the algorithm (constructor or factory method).

    1.  If k is the name of an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` on this interface, set the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute of this `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` to v.
    2.  Else if k is the name of an attribute on this interface, set the object associated with this attribute to v.

The associated interface for a factory method is the interface of the objects that are returned from this method. The associated option object for an interface is the option object that can be passed to the constructor for this interface.

`[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s are `[EventTarget](https://dom.spec.whatwg.org/#eventtarget)`s, as described in [\[DOM\]](https://www.w3.org/TR/webaudio/#biblio-dom). This means that it is possible to dispatch events to `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s the same way that other `[EventTarget](https://dom.spec.whatwg.org/#eventtarget)`s accept events.

enum `ChannelCountMode` {
["max"](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max),
["clamped-max"](https://www.w3.org/TR/webaudio/#dom-channelcountmode-clamped-max),
["explicit"](https://www.w3.org/TR/webaudio/#dom-channelcountmode-explicit)
};

The `[ChannelCountMode](https://www.w3.org/TR/webaudio/#enumdef-channelcountmode)`, in conjuction with the node’s `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` and `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` values, is used to determine the computedNumberOfChannels that controls how inputs to a node are to be mixed. The [computedNumberOfChannels](https://www.w3.org/TR/webaudio/#computednumberofchannels) is determined as shown below. See [§ 4 Channel Up-Mixing and Down-Mixing](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) for more information on how mixing is to be done.

enum `ChannelInterpretation` {
["speakers"](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-speakers),
["discrete"](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-discrete)
};

Enumeration description

"`speakers`"

use [up-mix equations](https://www.w3.org/TR/webaudio/#UpMix-sub) or [down-mix equations](https://www.w3.org/TR/webaudio/#down-mix). In cases where the number of channels do not match any of these basic speaker layouts, revert to "`[discrete](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-discrete)`".

"`discrete`"

Up-mix by filling channels until they run out then zero out remaining channels. Down-mix by filling as many channels as possible, then dropping remaining channels.

#### 1.5.2. AudioNode Tail-Time[](https://www.w3.org/TR/webaudio/#AudioNode-tail)

An `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` can have a tail-time. This means that even when the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` is fed silence, the output can be non-silent.

`[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s have a non-zero tail-time if they have internal processing state such that input in the past affects the future output. `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s may continue to produce non-silent output for the calculated tail-time even after the input transitions from non-silent to silent.

#### 1.5.3. AudioNode Lifetime[](https://www.w3.org/TR/webaudio/#AudioNode-actively-processing)

`[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` can be actively processing during a [render quantum](https://www.w3.org/TR/webaudio/#render-quantum), if any of the following conditions hold.

- An `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) if and only if it is [playing](https://www.w3.org/TR/webaudio/#playing) for at least part of the current rendering quantum.
- A `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) if and only if its `[mediaElement](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourcenode-mediaelement)` is playing for at least part of the current rendering quantum.
- A `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` or a `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` are [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) when the associated `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` object has a `readyState` attribute equal to `"live"`, a `muted` attribute equal to `false` and an `enabled` attribute equal to `true`.
- A `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` in a cycle is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) only when the absolute value of any output sample for the current [render quantum](https://www.w3.org/TR/webaudio/#render-quantum) is greater than or equal to 2−126.
- A `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) when its input or output is connected.
- An `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) when its `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`'s `[[[callable process]]](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-callable-process-slot)` returns `true` and either its [active source](https://www.w3.org/TR/webaudio/#active-source) flag is `true` or any `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` connected to one of its inputs is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing).
- All other `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s start [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) when any `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` connected to one of its inputs is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing), and stops [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) when the input that was received from other [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` no longer affects the output.

Note: This takes into account `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s that have a [tail-time](https://www.w3.org/TR/webaudio/#tail-time).

`[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s that are not [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) output a single channel of silence.

#### 1.5.4. Attributes[](https://www.w3.org/TR/webaudio/#AudioNode-attributes)

[AudioNode/channelCount](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelCount "The channelCount property of the AudioNode interface represents an integer used to determine how many channels are used when up-mixing and down-mixing connections to any inputs to the node.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`channelCount`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long)

`[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` is the number of channels used when up-mixing and down-mixing connections to any inputs to the node. The default value is 2 except for specific nodes where its value is specially determined. This attribute has no effect for nodes with no inputs. If this value is set to zero or to a value greater than the implementation’s maximum number of channels the implementation MUST throw a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception.

In addition, some nodes have additional channelCount constraints on the possible values for the channel count:

`[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)`

The behavior depends on whether the destination node is the destination of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` or `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`:

`[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`

The channel count MUST be between 1 and `[maxChannelCount](https://www.w3.org/TR/webaudio/#dom-audiodestinationnode-maxchannelcount)`. An `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown for any attempt to set the count outside this range.

`[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`

The channel count cannot be changed. An `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

`[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`

See [§ 1.32.3.3.2 Configuring Channels with AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#configuring-channels-with-audioworkletnodeoptions) Configuring Channels with AudioWorkletNodeOptions.

`[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)`

The channel count cannot be changed, and an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

`[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`

The channel count cannot be changed, and an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

`[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`

The channel count cannot be greater than two, and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to change it to a value greater than two.

`[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`

The channel count cannot be greater than two, and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to change it to a value greater than two.

`[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`

The channel count cannot be greater than two, and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to change it to a value greater than two.

`[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)`

The channel count cannot be changed, and an `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to change the value.

`[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)`

The channel count cannot be greater than two, and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to change it to a value greater than two.

See [§ 4 Channel Up-Mixing and Down-Mixing](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) for more information on this attribute.

[AudioNode/channelCountMode](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelCountMode "The channelCountMode property of the AudioNode interface represents an enumerated value describing the way channels must be matched between the node's inputs and outputs.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`channelCountMode`, of type [ChannelCountMode](https://www.w3.org/TR/webaudio/#enumdef-channelcountmode)

`[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionode-channelcountmode)` determines how channels will be counted when up-mixing and down-mixing connections to any inputs to the node. The default value is "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`". This attribute has no effect for nodes with no inputs.

In addition, some nodes have additional channelCountMode constraints on the possible values for the channel count mode:

`[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)`

If the `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` is the `[destination](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-destination)` node of an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`, then the channel count mode cannot be changed. An `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

`[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)`

The channel count mode cannot be changed from "`[explicit](https://www.w3.org/TR/webaudio/#dom-channelcountmode-explicit)`" and an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

`[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`

The channel count mode cannot be changed from "`[explicit](https://www.w3.org/TR/webaudio/#dom-channelcountmode-explicit)`" and an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

`[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`

The channel count mode cannot be set to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`", and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to set it to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`".

`[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`

The channel count mode cannot be set to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`", and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to set it to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`".

`[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`

The channel count mode cannot be set to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`", and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to set it to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`".

`[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)`

The channel count mode cannot be changed from "`[explicit](https://www.w3.org/TR/webaudio/#dom-channelcountmode-explicit)`" and an `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to change the value.

`[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)`

The channel count mode cannot be set to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`", and a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown for any attempt to set it to "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`".

See the [§ 4 Channel Up-Mixing and Down-Mixing](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) section for more information on this attribute.

[AudioNode/channelInterpretation](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/channelInterpretation "The channelInterpretation property of the AudioNode interface represents an enumerated value describing the meaning of the channels. This interpretation will define how audio up-mixing and down-mixing will happen.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`channelInterpretation`, of type [ChannelInterpretation](https://www.w3.org/TR/webaudio/#enumdef-channelinterpretation)

`[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` determines how individual channels will be treated when up-mixing and down-mixing connections to any inputs to the node. The default value is "`[speakers](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-speakers)`". This attribute has no effect for nodes with no inputs.

In addition, some nodes have additional channelInterpretation constraints on the possible values for the channel interpretation:

`[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`

The channel intepretation can not be changed from "`[discrete](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-discrete)`" and a `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown for any attempt to change the value.

See [§ 4 Channel Up-Mixing and Down-Mixing](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) for more information on this attribute.

[AudioNode/context](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/context "The read-only context property of the AudioNode interface returns the associated BaseAudioContext, that is the object representing the processing graph the node is participating in.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`context`, of type [BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext), readonly

The `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` which owns this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

[AudioNode/numberOfInputs](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/numberOfInputs "The numberOfInputs property of the AudioNode interface returns the number of inputs feeding the node. Source nodes are defined as nodes having a numberOfInputs property with a value of 0.The numberOfInputs property of the AudioNode interface returns the number of inputs feeding the node.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`numberOfInputs`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

The number of inputs feeding into the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`. For source nodes, this will be 0. This attribute is predetermined for many `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` types, but some `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s, like the `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` and the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`, have variable number of inputs.

[AudioNode/numberOfOutputs](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/numberOfOutputs "The numberOfOutputs property of the AudioNode interface returns the number of outputs coming out of the node. Destination nodes — like AudioDestinationNode — have a value of 0 for this attribute.The numberOfOutputs property of the AudioNode interface returns the number of outputs coming out of the node.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`numberOfOutputs`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

The number of outputs coming out of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`. This attribute is predetermined for some `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` types, but can be variable, like for the `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` and the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

#### 1.5.5. Methods[](https://www.w3.org/TR/webaudio/#AudioNode-methods)

[AudioNode/connect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect "The connect() method of the AudioNode interface lets you connect one of the node's outputs to a target, which may be either another AudioNode (thereby directing the sound data to the specified node) or an AudioParam, so that the node's output data is automatically used to change the value of that parameter over time.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`connect(destinationNode, output, input)`

There can only be one connection between a given output of one specific node and a given input of another specific node. Multiple connections with the same termini are ignored.

[](https://www.w3.org/TR/webaudio/#example-bbcc3e9e)For example:

nodeA.connect(nodeB);
nodeA.connect(nodeB);

will have the same effect as

nodeA.connect(nodeB);

This method returns `destination` `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` object.

[AudioNode/connect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/connect "The connect() method of the AudioNode interface lets you connect one of the node's outputs to a target, which may be either another AudioNode (thereby directing the sound data to the specified node) or an AudioParam, so that the node's output data is automatically used to change the value of that parameter over time.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`connect(destinationParam, output)`

Connects the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`, controlling the parameter value with an [a-rate](https://www.w3.org/TR/webaudio/#a-rate) signal.

It is possible to connect an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` output to more than one `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` with multiple calls to connect(). Thus, "fan-out" is supported.

It is possible to connect more than one `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` output to a single `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` with multiple calls to connect(). Thus, "fan-in" is supported.

An `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` will take the rendered audio data from any `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` output connected to it and [convert it to mono](https://www.w3.org/TR/webaudio/#down-mix) by down-mixing if it is not already mono, then mix it together with other such outputs and finally will mix with the _intrinsic_ parameter value (the `value` the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` would normally have without any audio connections), including any timeline changes scheduled for the parameter.

The down-mixing to mono is equivalent to the down-mixing for an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` with `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` = 1, `[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionode-channelcountmode)` = "`[explicit](https://www.w3.org/TR/webaudio/#dom-channelcountmode-explicit)`", and `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` = "`[speakers](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-speakers)`".

There can only be one connection between a given output of one specific node and a specific `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. Multiple connections with the same termini are ignored.

[](https://www.w3.org/TR/webaudio/#example-8779522d)For example:

nodeA.connect(param);
nodeA.connect(param);

will have the same effect as

nodeA.connect(param);

[AudioNode/disconnect](https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/disconnect "The disconnect() method of the AudioNode interface lets you disconnect one or more nodes from the node on which the method is called.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`disconnect()`

Disconnects all outgoing connections from the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

_No parameters._

`disconnect(output)`

Disconnects a single output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from any other `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` or `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` objects to which it is connected.

Arguments for the [AudioNode.disconnect(output)](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-output) method.

Parameter

Type

Nullable

Optional

Description

`output`

unsigned long

✘

✘

This parameter is an index describing which output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to disconnect. It disconnects all outgoing connections from the given output. If this parameter is out-of-bounds, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

`disconnect(destinationNode)`

Disconnects all outputs of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` that go to a specific destination `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

Arguments for the [AudioNode.disconnect(destinationNode)](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode) method.

Parameter

Type

Nullable

Optional

Description

`destinationNode`

The `destinationNode` parameter is the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to disconnect. It disconnects all outgoing connections to the given `destinationNode`. If there is no connection to the `destinationNode`, an `[InvalidAccessError](https://heycam.github.io/webidl/#invalidaccesserror)` exception MUST be thrown.

`disconnect(destinationNode, output)`

Disconnects a specific output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from any and all inputs of some destination `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

Arguments for the [AudioNode.disconnect(destinationNode, output)](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output) method.

Parameter

Type

Nullable

Optional

Description

`destinationNode`

The `destinationNode` parameter is the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to disconnect. If there is no connection to the `destinationNode` from the given output, an `[InvalidAccessError](https://heycam.github.io/webidl/#invalidaccesserror)` exception MUST be thrown.

`output`

unsigned long

✘

✘

The `output` parameter is an index describing which output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from which to disconnect. If this parameter is out-of-bounds, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

`disconnect(destinationNode, output, input)`

Disconnects a specific output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from a specific input of some destination `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

Arguments for the [AudioNode.disconnect(destinationNode, output, input)](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationnode-output-input) method.

Parameter

Type

Nullable

Optional

Description

`destinationNode`

The `destinationNode` parameter is the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to disconnect. If there is no connection to the `destinationNode` from the given input to the given output, an `[InvalidAccessError](https://heycam.github.io/webidl/#invalidaccesserror)` exception MUST be thrown.

`output`

unsigned long

✘

✘

The `output` parameter is an index describing which output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from which to disconnect. If this parameter is out-of-bounds, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

`input`

The `input` parameter is an index describing which input of the destination `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to disconnect. If this parameter is out-of-bounds, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

`disconnect(destinationParam)`

Disconnects all outputs of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` that go to a specific destination `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. The contribution of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to the computed parameter value goes to 0 when this operation takes effect. The intrinsic parameter value is not affected by this operation.

`disconnect(destinationParam, output)`

Disconnects a specific output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from a specific destination `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. The contribution of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to the computed parameter value goes to 0 when this operation takes effect. The intrinsic parameter value is not affected by this operation.

Arguments for the [AudioNode.disconnect(destinationParam, output)](https://www.w3.org/TR/webaudio/#dom-audionode-disconnect-destinationparam-output) method.

Parameter

Type

Nullable

Optional

Description

`destinationParam`

AudioParam

✘

✘

The `destinationParam` parameter is the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` to disconnect. If there is no connection to the `destinationParam`, an `[InvalidAccessError](https://heycam.github.io/webidl/#invalidaccesserror)` exception MUST be thrown.

`output`

unsigned long

✘

✘

The `output` parameter is an index describing which output of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` from which to disconnect. If the `parameter` is out-of-bounds, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

#### 1.5.6. `[AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions)`[](https://www.w3.org/TR/webaudio/#AudioNodeOptions)

This specifies the options that can be used in constructing all `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s. All members are optional. However, the specific values used for each node depends on the actual node.

[AudioNodeOptions](https://developer.mozilla.org/en-US/docs/Web/API/AudioNodeOptions "The AudioNodeOptions dictionary of the Web Audio API specifies options that can be used when creating new AudioNode objects.")

Firefox53+Safari?Chrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS Safari?Chrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

dictionary `AudioNodeOptions` {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [channelCount](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelcount);
[ChannelCountMode](https://www.w3.org/TR/webaudio/#enumdef-channelcountmode) [channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelcountmode);
[ChannelInterpretation](https://www.w3.org/TR/webaudio/#enumdef-channelinterpretation) [channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelinterpretation);
};

##### 1.5.6.1. Dictionary `[AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audionodeoptions-members)

`channelCount`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long)

Desired number of channels for the `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` attribute.

`channelCountMode`, of type [ChannelCountMode](https://www.w3.org/TR/webaudio/#enumdef-channelcountmode)

Desired mode for the `[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionode-channelcountmode)` attribute.

`channelInterpretation`, of type [ChannelInterpretation](https://www.w3.org/TR/webaudio/#enumdef-channelinterpretation)

Desired mode for the `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` attribute.

### 1.6. The `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` Interface[](https://www.w3.org/TR/webaudio/#AudioParam)

[AudioParam](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam "The Web Audio API's AudioParam interface represents an audio-related parameter, usually a parameter of an AudioNode (such as GainNode.gain).")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` controls an individual aspect of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`'s functionality, such as volume. The parameter can be set immediately to a particular value using the `value` attribute. Or, value changes can be scheduled to happen at very precise times (in the coordinate system of `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute), for envelopes, volume fades, LFOs, filter sweeps, grain windows, etc. In this way, arbitrary timeline-based automation curves can be set on any `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. Additionally, audio signals from the outputs of `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s can be connected to an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`, summing with the _intrinsic_ parameter value.

Some synthesis and processing `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s have `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s as attributes whose values MUST be taken into account on a per-audio-sample basis. For other `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s, sample-accuracy is not important and the value changes can be sampled more coarsely. Each individual `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` will specify that it is either an [a-rate](https://www.w3.org/TR/webaudio/#a-rate) parameter which means that its values MUST be taken into account on a per-audio-sample basis, or it is a [k-rate](https://www.w3.org/TR/webaudio/#k-rate) parameter.

Implementations MUST use block processing, with each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` processing one [render quantum](https://www.w3.org/TR/webaudio/#render-quantum).

For each [render quantum](https://www.w3.org/TR/webaudio/#render-quantum), the value of a k-rate parameter MUST be sampled at the time of the very first sample-frame, and that value MUST be used for the entire block. a-rate parameters MUST be sampled for each sample-frame of the block. Depending on the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`, its rate can be controlled by setting the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)` attribute to either "`[a-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-a-rate)`" or "`[k-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)`". See the description of the individual `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s for further details.

Each `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` includes `[minValue](https://www.w3.org/TR/webaudio/#dom-audioparam-minvalue)` and `[maxValue](https://www.w3.org/TR/webaudio/#dom-audioparam-maxvalue)` attributes that together form the simple nominal range for the parameter. In effect, value of the parameter is clamped to the range \[minValue,maxValue\]. See [§ 1.6.3 Computation of Value](https://www.w3.org/TR/webaudio/#computation-of-value) for full details.

For many `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s the `[minValue](https://www.w3.org/TR/webaudio/#dom-audioparam-minvalue)` and `[maxValue](https://www.w3.org/TR/webaudio/#dom-audioparam-maxvalue)` is intended to be set to the maximum possible range. In this case, `[maxValue](https://www.w3.org/TR/webaudio/#dom-audioparam-maxvalue)` should be set to the most-positive-single-float value, which is 3.4028235e38. (However, in JavaScript which only supports IEEE-754 double precision float values, this must be written as 3.4028234663852886e38.) Similarly, `[minValue](https://www.w3.org/TR/webaudio/#dom-audioparam-minvalue)` should be set to the most-negative-single-float value, which is the negative of the [most-positive-single-float](https://www.w3.org/TR/webaudio/#most-positive-single-float): -3.4028235e38. (Similarly, this must be written in JavaScript as -3.4028234663852886e38.)

An `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` maintains a list of zero or more automation events. Each automation event specifies changes to the parameter’s value over a specific time range, in relation to its automation event time in the time coordinate system of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute. The list of automation events is maintained in ascending order of automation event time.

The behavior of a given automation event is a function of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s current time, as well as the automation event times of this event and of adjacent events in the list. The following automation methods change the event list by adding a new event to the event list, of a type specific to the method:

- `[setValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime)` - `SetValue`
- `[linearRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime)` - `LinearRampToValue`
- `[exponentialRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime)` - `ExponentialRampToValue`
- `[setTargetAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime)` - `SetTarget`
- `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)` - `SetValueCurve`

The following rules will apply when calling these methods:

- [Automation event times](https://www.w3.org/TR/webaudio/#automation-event-time) are not quantized with respect to the prevailing sample rate. Formulas for determining curves and ramps are applied to the exact numerical times given when scheduling events.
- If one of these events is added at a time where there is already one or more events, then it will be placed in the list after them, but before events whose times are after the event.
- If [setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime) is called for time T and duration D and there are any events having a time strictly greater than T, but strictly less than T+D, then a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown. In other words, it’s not ok to schedule a value curve during a time period containing other events, but it’s ok to schedule a value curve exactly at the time of another event.
- Similarly a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown if any [automation method](https://www.w3.org/TR/webaudio/#dfn-automation-method) is called at a time which is contained in \[T,T+D), T being the time of the curve and D its duration.

Note: `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` attributes are read only, with the exception of the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute.

The automation rate of an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` can be selected setting the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)` attribute with one of the following values. However, some `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s have constraints on whether the automation rate can be changed.

enum `AutomationRate` {
["a-rate"](https://www.w3.org/TR/webaudio/#dom-automationrate-a-rate),
["k-rate"](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)
};

Each `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` has an internal slot `[[current value]]`, initially set to the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`'s `[defaultValue](https://www.w3.org/TR/webaudio/#dom-audioparam-defaultvalue)`.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioParam` {
attribute [float](https://heycam.github.io/webidl/#idl-float) [value](https://www.w3.org/TR/webaudio/#dom-audioparam-value);
attribute [AutomationRate](https://www.w3.org/TR/webaudio/#enumdef-automationrate) [automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate);
readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [defaultValue](https://www.w3.org/TR/webaudio/#dom-audioparam-defaultvalue);
readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [minValue](https://www.w3.org/TR/webaudio/#dom-audioparam-minvalue);
readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [maxValue](https://www.w3.org/TR/webaudio/#dom-audioparam-maxvalue);
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [setValueAtTime](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime) ([float](https://heycam.github.io/webidl/#idl-float) `value`[](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime-value-starttime-value), [double](https://heycam.github.io/webidl/#idl-double) `startTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime-value-starttime-starttime));
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [linearRampToValueAtTime](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime) ([float](https://heycam.github.io/webidl/#idl-float) `value`[](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime-value-endtime-value), [double](https://heycam.github.io/webidl/#idl-double) `endTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime-value-endtime-endtime));
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [exponentialRampToValueAtTime](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime) ([float](https://heycam.github.io/webidl/#idl-float) `value`[](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime-value-endtime-value), [double](https://heycam.github.io/webidl/#idl-double) `endTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime-value-endtime-endtime));
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [setTargetAtTime](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime) ([float](https://heycam.github.io/webidl/#idl-float) `target`[](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-target-starttime-timeconstant-target), [double](https://heycam.github.io/webidl/#idl-double) `startTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-target-starttime-timeconstant-starttime), [float](https://heycam.github.io/webidl/#idl-float) `timeConstant`[](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-target-starttime-timeconstant-timeconstant));
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [setValueCurveAtTime](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime) ([sequence](https://heycam.github.io/webidl/#idl-sequence)<[float](https://heycam.github.io/webidl/#idl-float)\> `values`[](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-values-starttime-duration-values),
[double](https://heycam.github.io/webidl/#idl-double) `startTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-values-starttime-duration-starttime),
[double](https://heycam.github.io/webidl/#idl-double) `duration`[](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-values-starttime-duration-duration));
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [cancelScheduledValues](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues) ([double](https://heycam.github.io/webidl/#idl-double) `cancelTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues-canceltime-canceltime));
[AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [cancelAndHoldAtTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime) ([double](https://heycam.github.io/webidl/#idl-double) `cancelTime`[](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime-canceltime-canceltime));
};

#### 1.6.1. Attributes[](https://www.w3.org/TR/webaudio/#AudioParam-attributes)

`automationRate`, of type [AutomationRate](https://www.w3.org/TR/webaudio/#enumdef-automationrate)

The automation rate for the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. The default value depends on the actual `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`; see the description of each individual `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` for the default value.

Some nodes have additional automation rate constraints as follows:

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`

The `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` and `[detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-detune)` MUST be "`[k-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)`". An `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` must be thrown if the rate is changed to "`[a-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-a-rate)`".

`[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`

The `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s `[threshold](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-threshold)`, `[knee](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-knee)`, `[ratio](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-ratio)`, `[attack](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-attack)`, and `[release](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-release)` MUST be "`[k-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)`". An `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` must be thrown if the rate is changed to "`[a-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-a-rate)`".

`[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`

If the `[panningModel](https://www.w3.org/TR/webaudio/#dom-pannernode-panningmodel)` is "`[HRTF](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-hrtf)`", the setting of the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)` for any `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` of the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` is ignored. Likewise, the setting of the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)` for any `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` of the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` is ignored. In this case, the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` behaves as if the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)` were set to "`[k-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)`".

[AudioParam/defaultValue](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/defaultValue "The defaultValue read-only property of the AudioParam interface represents the initial value of the attributes as defined by the specific AudioNode creating the AudioParam.The defaultValue read-only property of the AudioParam interface represents the initial value of the attributes as defined by the specific AudioNode creating the AudioParam.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`defaultValue`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

Initial value for the `value` attribute.

[AudioParam/maxValue](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/maxValue "The maxValue read-only property of the AudioParam interface represents the maximum possible value for the parameter's nominal (effective) range.The maxValue read-only property of the AudioParam interface represents the maximum possible value for the parameter's nominal (effective) range.")

In all current engines.

Firefox53+Safari6+Chrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariYesChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`maxValue`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

The nominal maximum value that the parameter can take. Together with `minValue`, this forms the [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) for this parameter.

[AudioParam/minValue](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/minValue "The minValue read-only property of the AudioParam interface represents the minimum possible value for the parameter's nominal (effective) range.The minValue read-only property of the AudioParam interface represents the minimum possible value for the parameter's nominal (effective) range.")

In all current engines.

Firefox53+Safari6+Chrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariYesChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`minValue`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

The nominal minimum value that the parameter can take. Together with `maxValue`, this forms the [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) for this parameter.

[AudioParam/value](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/value "The Web Audio API's AudioParam interface property value gets or sets the value of this AudioParam at the current time. Initially, the value is set to AudioParam.defaultValue.The Web Audio API's AudioParam interface property value gets or sets the value of this AudioParam at the current time.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`value`, of type [float](https://heycam.github.io/webidl/#idl-float)

The parameter’s floating-point value. This attribute is initialized to the `defaultValue`.

Getting this attribute returns the contents of the `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)` slot. See [§ 1.6.3 Computation of Value](https://www.w3.org/TR/webaudio/#computation-of-value) for the algorithm for the value that is returned.

Setting this attribute has the effect of assigning the requested value to the `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)` slot, and calling the [setValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime) method with the current `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `currentTime` and `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)`. Any exceptions that would be thrown by `setValueAtTime()` will also be thrown by setting this attribute.

#### 1.6.2. Methods[](https://www.w3.org/TR/webaudio/#AudioParam-methods)

[AudioParam/cancelAndHoldAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime "The cancelAndHoldAtTime() property of the AudioParam interface cancels all scheduled future changes to the AudioParam but holds its value at a given time until further changes are made using other methods.")

In only one current engine.

FirefoxNoneSafariNoneChrome57+

---

Opera44+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android57+Android WebView57+Samsung Internet7.0+Opera Mobile43+

`cancelAndHoldAtTime(cancelTime)`

This is similar to `[cancelScheduledValues()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues)` in that it cancels all scheduled parameter changes with times greater than or equal to `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime-canceltime)`. However, in addition, the automation value that would have happened at `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime-canceltime)` is then proprogated for all future time until other automation events are introduced.

The behavior of the timeline in the face of `[cancelAndHoldAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime)` when automations are running and can be introduced at any time after calling `[cancelAndHoldAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime)` and before `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime-canceltime)` is reached is quite complicated. The behavior of `[cancelAndHoldAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime)` is therefore specified in the following algorithm.

Let tc be the value of `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime-canceltime)`. Then

1.  Let E1 be the event (if any) at time t1 where t1 is the largest number satisfying t1≤tc.
2.  Let E2 be the event (if any) at time t2 where t2 is the smallest number satisfying tc<t2.
3.  If E2 exists:

    1.  If E2 is a linear or exponential ramp,

        1.  Effectively rewrite E2 to be the same kind of ramp ending at time tc with an end value that would be the value of the original ramp at time tc. ![Graphical representation of calling cancelAndHoldAtTime when linearRampToValueAtTime has been called at this time.](https://www.w3.org/TR/webaudio/images/cancel-linear.svg)
        2.  Go to step 5.

    2.  Otherwise, go to step 4.

4.  If E1 exists:

    1.  If E1 is a `setTarget` event,

        1.  Implicitly insert a `setValueAtTime` event at time tc with the value that the `setTarget` would have at time tc. ![Graphical representation of calling cancelAndHoldAtTime when setTargetAtTime has been called at this time](https://www.w3.org/TR/webaudio/images/cancel-setTarget.svg)
        2.  Go to step 5.

    2.  If E1 is a `setValueCurve` with a start time of t3 and a duration of d

        1.  If tc\>t3+d, go to step 5.
        2.  Otherwise,

            1.  Effectively replace this event with a `setValueCurve` event with a start time of t3 and a new duration of tc−t3. However, this is not a true replacement; this automation MUST take care to produce the same output as the original, and not one computed using a different duration. (That would cause sampling of the value curve in a slightly different way, producing different results.) ![Graphical representation of calling cancelAndHoldAtTime when setValueCurve has been called at this time](https://www.w3.org/TR/webaudio/images/cancel-setValueCurve.svg)
            2.  Go to step 5.

5.  Remove all events with time greater than tc.

If no events are added, then the automation value after `[cancelAndHoldAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime)` is the constant value that the original timeline would have had at time tc.

[AudioParam/cancelScheduledValues](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelScheduledValues "The cancelScheduledValues() method of the AudioParam Interface cancels all scheduled future changes to the AudioParam.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`cancelScheduledValues(cancelTime)`

Cancels all scheduled parameter changes with times greater than or equal to `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues-canceltime)`. Cancelling a scheduled parameter change means removing the scheduled event from the event list. Any active automations whose [automation event time](https://www.w3.org/TR/webaudio/#automation-event-time) is less than `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues-canceltime)` are also cancelled, and such cancellations may cause discontinuities because the original value (from before such automation) is restored immediately. Any hold values scheduled by `[cancelAndHoldAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelandholdattime)` are also removed if the hold time occurs after `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues-canceltime)`.

For a `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)`, let T0 and TD be the corresponding `[startTime](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-starttime)` and `[duration](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-duration)`, respectively of this event. Then if `[cancelTime](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues-canceltime)` is in the range \[T0,T0+TD\], the event is removed from the timeline.

Arguments for the [AudioParam.cancelScheduledValues()](https://www.w3.org/TR/webaudio/#dom-audioparam-cancelscheduledvalues) method.

Parameter

Type

Nullable

Optional

Description

`cancelTime`

double

✘

✘

The time after which any previously scheduled parameter changes will be cancelled. It is a time in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `cancelTime` is negative or is not a finite number. If `cancelTime` is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, it is clamped to `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

[AudioParam/exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime "The exponentialRampToValueAtTime() method of the AudioParam Interface schedules a gradual exponential change in the value of the AudioParam. The change starts at the time specified for the previous event, follows an exponential ramp to the new value given in the value parameter, and reaches the new value at the time given in the endTime parameter.")

FirefoxNoneSafari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for AndroidNoneiOS SafariYesChrome for AndroidNoneAndroid WebView37+Samsung Internet1.0+Opera Mobile14+

`exponentialRampToValueAtTime(value, endTime)`

Schedules an exponential continuous change in parameter value from the previous scheduled parameter value to the given value. Parameters representing filter frequencies and playback rate are best changed exponentially because of the way humans perceive sound.

The value during the time interval T0≤t<T1 (where T0 is the time of the previous event and T1 is the `[endTime](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime-endtime)` parameter passed into this method) will be calculated as:

v(t)\=V0(V1V0)t−T0T1−T0

where V0 is the value at the time T0 and V1 is the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime-value)` parameter passed into this method. If V0 and V1 have opposite signs or if V0 is zero, then v(t)\=V0 for T0≤t<T1.

This also implies an exponential ramp to 0 is not possible. A good approximation can be achieved using `[setTargetAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime)` with an appropriately chosen time constant.

If there are no more events after this _ExponentialRampToValue_ event then for t≥T1, v(t)\=V1.

If there is no event preceding this event, the exponential ramp behaves as if `[setValueAtTime(value, currentTime)](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime)` were called where `value` is the current value of the attribute and `currentTime` is the context `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` at the time `[exponentialRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime)` is called.

If the preceding event is a `SetTarget` event, T0 and V0 are chosen from the current time and value of `SetTarget` automation. That is, if the `SetTarget` event has not started, T0 is the start time of the event, and V0 is the value just before the `SetTarget` event starts. In this case, the `ExponentialRampToValue` event effectively replaces the `SetTarget` event. If the `SetTarget` event has already started, T0 is the current context time, and V0 is the current `SetTarget` automation value at time T0. In both cases, the automation curve is continuous.

Arguments for the [AudioParam.exponentialRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime) method.

Parameter

Type

Nullable

Optional

Description

`value`

float

✘

✘

The value the parameter will exponentially ramp to at the given time. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if this value is equal to 0.

`endTime`

double

✘

✘

The time in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute where the exponential ramp ends. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `endTime` is negative or is not a finite number. If endTime is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, it is clamped to `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

[AudioParam/linearRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime "The linearRampToValueAtTime() method of the AudioParam Interface schedules a gradual linear change in the value of the AudioParam. The change starts at the time specified for the previous event, follows a linear ramp to the new value given in the value parameter, and reaches the new value at the time given in the endTime parameter.")

FirefoxNoneSafari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for AndroidNoneiOS Safari?Chrome for AndroidNoneAndroid WebView37+Samsung Internet1.0+Opera Mobile14+

`linearRampToValueAtTime(value, endTime)`

Schedules a linear continuous change in parameter value from the previous scheduled parameter value to the given value.

The value during the time interval T0≤t<T1 (where T0 is the time of the previous event and T1 is the `[endTime](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime-endtime)` parameter passed into this method) will be calculated as:

v(t)\=V0+(V1−V0)t−T0T1−T0

where V0 is the value at the time T0 and V1 is the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime-value)` parameter passed into this method.

If there are no more events after this _LinearRampToValue_ event then for t≥T1, v(t)\=V1.

If there is no event preceding this event, the linear ramp behaves as if `[setValueAtTime(value, currentTime)](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime)` were called where `value` is the current value of the attribute and `currentTime` is the context `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` at the time `[linearRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime)` is called.

If the preceding event is a `SetTarget` event, T0 and V0 are chosen from the current time and value of `SetTarget` automation. That is, if the `SetTarget` event has not started, T0 is the start time of the event, and V0 is the value just before the `SetTarget` event starts. In this case, the `LinearRampToValue` event effectively replaces the `SetTarget` event. If the `SetTarget` event has already started, T0 is the current context time, and V0 is the current `SetTarget` automation value at time T0. In both cases, the automation curve is continuous.

Arguments for the [AudioParam.linearRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime) method.

Parameter

Type

Nullable

Optional

Description

`value`

float

✘

✘

The value the parameter will linearly ramp to at the given time.

`endTime`

double

✘

✘

The time in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute at which the automation ends. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `endTime` is negative or is not a finite number. If endTime is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, it is clamped to `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

[AudioParam/setTargetAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime "The setTargetAtTime() method of the AudioParam interface schedules the start of a gradual change to the AudioParam value. This is useful for decay or release portions of ADSR envelopes.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`setTargetAtTime(target, startTime, timeConstant)`

Start exponentially approaching the target value at the given time with a rate having the given time constant. Among other uses, this is useful for implementing the "decay" and "release" portions of an ADSR envelope. Please note that the parameter value does not immediately change to the target value at the given time, but instead gradually changes to the target value.

During the time interval: T0≤t, where T0 is the `[startTime](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-starttime)` parameter:

v(t)\=V1+(V0−V1)e−(t−T0τ)

where V0 is the initial value (the `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)` attribute) at T0 (the `[startTime](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-starttime)` parameter), V1 is equal to the `[target](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-target)` parameter, and τ is the `[timeConstant](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime-timeconstant)` parameter.

If a `LinearRampToValue` or `ExponentialRampToValue` event follows this event, the behavior is described in `[linearRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime)` or `[exponentialRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime)`, respectively. For all other events, the `SetTarget` event ends at the time of the next event.

Arguments for the [AudioParam.setTargetAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime) method.

Parameter

Type

Nullable

Optional

Description

`target`

float

✘

✘

The value the parameter will _start_ changing to at the given time.

`startTime`

double

✘

✘

The time at which the exponential approach will begin, in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `start` is negative or is not a finite number. If startTime is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, it is clamped to `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

`timeConstant`

float

✘

✘

The time-constant value of first-order filter (exponential) approach to the target value. The larger this value is, the slower the transition will be. The value MUST be non-negative or a `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown. If `timeConstant` is zero, the output value jumps immediately to the final value. More precisely, _timeConstant_ is the time it takes a first-order linear continuous time-invariant system to reach the value 1−1/e (around 63.2%) given a step input response (transition from 0 to 1 value).

[AudioParam/setValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setValueAtTime "The setValueAtTime() method of the AudioParam interface schedules an instant change to the AudioParam value at a precise time, as measured against AudioContext.currentTime. The new value is given in the value parameter. ")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`setValueAtTime(value, startTime)`

Schedules a parameter value change at the given time.

If there are no more events after this `SetValue` event, then for t≥T0, v(t)\=V, where T0 is the `[startTime](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime-starttime)` parameter and V is the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime-value)` parameter. In other words, the value will remain constant.

If the next event (having time T1) after this `SetValue` event is not of type `LinearRampToValue` or `ExponentialRampToValue`, then, for T0≤t<T1:

v(t)\=V

In other words, the value will remain constant during this time interval, allowing the creation of "step" functions.

If the next event after this `SetValue` event is of type `LinearRampToValue` or `ExponentialRampToValue` then please see `[linearRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-linearramptovalueattime)` or `[exponentialRampToValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-exponentialramptovalueattime)`, respectively.

Arguments for the [AudioParam.setValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime) method.

Parameter

Type

Nullable

Optional

Description

`value`

float

✘

✘

The value the parameter will change to at the given time.

`startTime`

double

✘

✘

The time in the same time coordinate system as the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute at which the parameter changes to the given value. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `startTime` is negative or is not a finite number. If startTime is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, it is clamped to `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

[AudioParam/setValueCurveAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setValueCurveAtTime "The setValueCurveAtTime() method of the AudioParam interface schedules the parameter's value to change following a curve defined by a list of values. The curve is a linear interpolation between the sequence of values defined in an array of floating-point values, which are scaled to fit into the given interval starting at startTime and a specific duration.The setValueCurveAtTime() method of the AudioParam interface schedules the parameter's value to change following a curve defined by a list of values.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`setValueCurveAtTime(values, startTime, duration)`

Sets an array of arbitrary parameter values starting at the given time for the given duration. The number of values will be scaled to fit into the desired duration.

Let T0 be `[startTime](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-starttime)`, TD be `[duration](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-duration)`, V be the `[values](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-values)` array, and N be the length of the `[values](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime-values)` array. Then, during the time interval: T0≤t<T0+TD, let

k\=⌊N−1TD(t−T0)⌋

Then v(t) is computed by linearly interpolating between V\[k\] and V\[k+1\],

After the end of the curve time interval (t≥T0+TD), the value will remain constant at the final curve value, until there is another automation event (if any).

An implicit call to `[setValueAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvalueattime)` is made at time T0+TD with value V\[N−1\] so that following automations will start from the end of the `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)` event.

Arguments for the [AudioParam.setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime) method.

Parameter

Type

Nullable

Optional

Description

`values`

sequence<float>

✘

✘

A sequence of float values representing a parameter value curve. These values will apply starting at the given time and lasting for the given duration. When this method is called, an internal copy of the curve is created for automation purposes. Subsequent modifications of the contents of the passed-in array therefore have no effect on the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. An `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` MUST be thrown if this attribute is a `sequence<float>` object that has a length less than 2.

`startTime`

double

✘

✘

The start time in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute at which the value curve will be applied. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `startTime` is negative or is not a finite number. If startTime is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, it is clamped to `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

`duration`

double

✘

✘

The amount of time in seconds (after the `startTime` parameter) where values will be calculated according to the `values` parameter. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `duration` is not strictly positive or is not a finite number.

#### 1.6.3. Computation of Value[](https://www.w3.org/TR/webaudio/#computation-of-value)

There are two different kind of `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s, [simple parameters](https://www.w3.org/TR/webaudio/#simple-parameter) and [compound parameters](https://www.w3.org/TR/webaudio/#compound-parameter). Simple parameters (the default) are used on their own to compute the final audio output of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`. Compound parameters are `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s that are used with other `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s to compute a value that is then used as an input to compute the output of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

The computedValue is the final value controlling the audio DSP and is computed by the audio rendering thread during each rendering time quantum.

The computation of the value of an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` consists of two parts:

- the paramIntrinsicValue value that is computed from the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute and any [automation events](https://www.w3.org/TR/webaudio/#dfn-automation-event).
- the paramComputedValue that is the final value controlling the audio DSP and is computed by the audio rendering thread during each [render quantum](https://www.w3.org/TR/webaudio/#render-quantum).

These values MUST be computed as follows:

1.  paramIntrinsicValue will be calculated at each time, which is either the value set directly to the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute, or, if there are any [automation events](https://www.w3.org/TR/webaudio/#dfn-automation-event) with times before or at this time, the value as calculated from these events. If automation events are removed from a given time range, then the paramIntrinsicValue value will remain unchanged and stay at its previous value until either the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute is directly set, or automation events are added for the time range.
2.  Set `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)` to the value of paramIntrinsicValue at the beginning of this [render quantum](https://www.w3.org/TR/webaudio/#render-quantum).
3.  paramComputedValue is the sum of the paramIntrinsicValue value and the value of the [input AudioParam buffer](https://www.w3.org/TR/webaudio/#input-audioparam-buffer). If the sum is `NaN`, replace the sum with the `[defaultValue](https://www.w3.org/TR/webaudio/#dom-audioparam-defaultvalue)`.
4.  If this `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` is a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter), compute its final value with other `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s.
5.  Set [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) to paramComputedValue.

The nominal range for a [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) are the lower and higher values this parameter can effectively have. For [simple parameters](https://www.w3.org/TR/webaudio/#simple-parameter), the [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) is clamped to the [simple nominal range](https://www.w3.org/TR/webaudio/#simple-nominal-range) for this parameter. [Compound parameters](https://www.w3.org/TR/webaudio/#compound-parameter) have their final value clamped to their [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) after having been computed from the different `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` values they are composed of.

When automation methods are used, clamping is still applied. However, the automation is run as if there were no clamping at all. Only when the automation values are to be applied to the output is the clamping done as specified above.

[](https://www.w3.org/TR/webaudio/#example-7a3be3df)For example, consider a node N has an AudioParam p with a nominal range of \[0,1\], and following automation sequence

N.p.setValueAtTime(0, 0);
N.p.linearRampToValueAtTime(4, 1);
N.p.linearRampToValueAtTime(0, 2);

The initial slope of the curve is 4, until it reaches the maximum value of 1, at which time, the output is held constant. Finally, near time 2, the slope of the curve is -4. This is illustrated in the graph below where the dashed line indicates what would have happened without clipping, and the solid line indicates the actual expected behavior of the audioparam due to clipping to the nominal range.

![AudioParam automation clipping to nominal](https://www.w3.org/TR/webaudio/images/audioparam-automation-clipping.png)

An example of clipping of an AudioParam automation from the nominal range.

#### 1.6.4. `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` Automation Example[](https://www.w3.org/TR/webaudio/#example1-AudioParam)

![AudioParam automation](https://www.w3.org/TR/webaudio/images/audioparam-automation1.png)

An example of parameter automation.

[](https://www.w3.org/TR/webaudio/#example-ab13e619)const curveLength \= 44100;const curve \= new Float32Array(curveLength);for (const i \= 0; i < curveLength; ++i) curve\[i\] \= Math.sin(Math.PI \* i / curveLength);const t0 \= 0;const t1 \= 0.1;const t2 \= 0.2;const t3 \= 0.3;const t4 \= 0.325;const t5 \= 0.5;const t6 \= 0.6;const t7 \= 0.7;const t8 \= 1.0;const timeConstant \= 0.1;param.setValueAtTime(0.2, t0);param.setValueAtTime(0.3, t1);param.setValueAtTime(0.4, t2);param.linearRampToValueAtTime(1, t3);param.linearRampToValueAtTime(0.8, t4);param.setTargetAtTime(.5, t4, timeConstant);// Compute where the setTargetAtTime will be at time t5 so we can make// the following exponential start at the right point so there’s no// jump discontinuity. From the spec, we have// v(t) = 0.5 + (0.8 - 0.5)\*exp(-(t-t4)/timeConstant)// Thus v(t5) = 0.5 + (0.8 - 0.5)\*exp(-(t5-t4)/timeConstant)param.setValueAtTime(0.5 + (0.8 \- 0.5)\*Math.exp(\-(t5 \- t4)/timeConstant), t5);param.exponentialRampToValueAtTime(0.75, t6);param.exponentialRampToValueAtTime(0.05, t7);param.setValueCurveAtTime(curve, t7, t8 \- t7);

### 1.7. The `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` Interface[](https://www.w3.org/TR/webaudio/#AudioScheduledSourceNode)

[AudioScheduledSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode "The AudioScheduledSourceNode interface—part of the Web Audio API—is a parent interface for several types of audio source node interfaces which share the ability to be started and stopped, optionally at specified times. Specifically, this interface defines the start() and stop() methods, as well as the onended event handler.")

In all current engines.

Firefox53+Safari14+Chrome57+

---

Opera44+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS Safari14+Chrome for Android57+Android WebView57+Samsung Internet7.0+Opera Mobile43+

The interface represents the common features of source nodes such as `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`, `[ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode)`, and `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.

Before a source is started (by calling `[start()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start)`, the source node MUST output silence (0). After a source has been stopped (by calling `[stop()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop)`), the source MUST then output silence (0).

`[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` cannot be instantiated directly, but is instead extended by the concrete interfaces for the source nodes.

An `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` is said to be playing when its associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#baseaudiocontext)` is greater or equal to the time the `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` is set to start, and less than the time it’s set to stop.

`[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)`s are created with an internal boolean slot `[[source started]]`, initially set to false.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioScheduledSourceNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
attribute [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler) [onended](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-onended);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [start](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start)(optional [double](https://heycam.github.io/webidl/#idl-double) [when](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start-when-when) = 0);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [stop](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop)(optional [double](https://heycam.github.io/webidl/#idl-double) [when](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop-when-when) = 0);
};

#### 1.7.1. Attributes[](https://www.w3.org/TR/webaudio/#AudioScheduledSourceNode-attributes)

[AudioScheduledSourceNode/ended_event](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/ended_event "The ended event of the AudioScheduledSourceNode interface is fired when the source node has stopped playing.")

In all current engines.

Firefox25+Safari7+Chrome30+

---

Opera17+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari7+Chrome for Android30+Android WebView37+Samsung Internet2.0+Opera Mobile18+

[AudioScheduledSourceNode/onended](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/onended "The onended event handler for the AudioScheduledSourceNode interface specifies an EventHandler to be executed when the ended event occurs on the node. This event is sent to the node when the concrete interface (such as AudioBufferSourceNode, OscillatorNode, or ConstantSourceNode) determines that it has stopped playing.")

In all current engines.

Firefox25+Safari7+Chrome30+

---

Opera17+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari7+Chrome for Android30+Android WebView37+Samsung Internet2.0+Opera Mobile18+

`onended`, of type [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)

A property used to set the `EventHandler` (described in [HTML](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)[\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html)) for the ended event that is dispatched for `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` node types. When the source node has stopped playing (as determined by the concrete node), an event of type `[Event](https://dom.spec.whatwg.org/#event)` (described in [HTML](https://html.spec.whatwg.org/multipage/infrastructure.html#event) [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html)) will be dispatched to the event handler.

For all `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)`s, the `onended` event is dispatched when the stop time determined by `[stop()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop)` is reached. For an `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`, the event is also dispatched because the `[duration](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-duration)` has been reached or if the entire `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` has been played.

#### 1.7.2. Methods[](https://www.w3.org/TR/webaudio/#AudioScheduledSourceNode-methods)

[AudioScheduledSourceNode/start](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/start "The start() method on AudioScheduledSourceNode schedules a sound to begin playback at the specified time. If no time is specified, then the sound begins playing immediately.")

In all current engines.

Firefox25+Safari6.1+Chrome24+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari7+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`start(when)`

Schedules a sound to playback at an exact time.

Arguments for the [AudioScheduledSourceNode.start(when)](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start) method.

Parameter

Type

Nullable

Optional

Description

`when`

double

✘

✔

The `[when](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start-when-when)` parameter describes at what time (in seconds) the sound should start playing. It is in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute. When the signal emitted by the `[AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode)` depends on the sound’s start time, the exact value of `when` is always used without rounding to the nearest sample frame. If 0 is passed in for this value or if the value is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, then the sound will start playing immediately. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `when` is negative.

[AudioScheduledSourceNode/stop](https://developer.mozilla.org/en-US/docs/Web/API/AudioScheduledSourceNode/stop "The stop() method on AudioScheduledSourceNode schedules a sound to cease playback at the specified time. If no time is specified, then the sound stops playing immediately.")

In all current engines.

Firefox25+Safari6.1+Chrome24+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari7+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`stop(when)`

Schedules a sound to stop playback at an exact time. If `stop` is called again after already having been called, the last invocation will be the only one applied; stop times set by previous calls will not be applied, unless the buffer has already stopped prior to any subsequent calls. If the buffer has already stopped, further calls to `stop` will have no effect. If a stop time is reached prior to the scheduled start time, the sound will not play.

Arguments for the [AudioScheduledSourceNode.stop(when)](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop) method.

Parameter

Type

Nullable

Optional

Description

`when`

double

✘

✔

The `[when](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop-when-when)` parameter describes at what time (in seconds) the source should stop playing. It is in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute. If 0 is passed in for this value or if the value is less than `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`, then the sound will stop playing immediately. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `when` is negative.

### 1.8. The `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` Interface[](https://www.w3.org/TR/webaudio/#AnalyserNode)

This interface represents a node which is able to provide real-time frequency and time-domain analysis information. The audio stream will be passed un-processed from input to output.

[AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode "The AnalyserNode interface represents a node able to provide real-time frequency and time-domain analysis information. It is an AudioNode that passes the audio stream unchanged from the input to the output, but allows you to take the generated data, process it, and create audio visualizations.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AnalyserNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-analysernode-analysernode) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-analysernode-analysernode-context-options-context), optional [AnalyserOptions](https://www.w3.org/TR/webaudio/#dictdef-analyseroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-analysernode-analysernode-context-options-options) = {});
[undefined](https://heycam.github.io/webidl/#idl-undefined) [getFloatFrequencyData](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata) ([Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata-array-array));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [getByteFrequencyData](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata) ([Uint8Array](https://heycam.github.io/webidl/#idl-Uint8Array) `array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata-array-array));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [getFloatTimeDomainData](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloattimedomaindata) ([Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloattimedomaindata-array-array));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [getByteTimeDomainData](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytetimedomaindata) ([Uint8Array](https://heycam.github.io/webidl/#idl-Uint8Array) `array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytetimedomaindata-array-array));
attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize);
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [frequencyBinCount](https://www.w3.org/TR/webaudio/#dom-analysernode-frequencybincount);
attribute [double](https://heycam.github.io/webidl/#idl-double) [minDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-mindecibels);
attribute [double](https://heycam.github.io/webidl/#idl-double) [maxDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-maxdecibels);
attribute [double](https://heycam.github.io/webidl/#idl-double) [smoothingTimeConstant](https://www.w3.org/TR/webaudio/#dom-analysernode-smoothingtimeconstant);
};

#### 1.8.1. Constructors[](https://www.w3.org/TR/webaudio/#AnalyserNode-constructors)

[AnalyserNode/AnalyserNode](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/AnalyserNode "The AnalyserNode constructor of the Web Audio API creates a new AnalyserNode object instance.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

`AnalyserNode(context, options)`

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.8.2. Attributes[](https://www.w3.org/TR/webaudio/#AnalyserNode-attributes)

[AnalyserNode/fftSize](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize "The fftSize property of the AnalyserNode interface is an unsigned long value and represents the window size in samples that is used when performing a Fast Fourier Transform (FFT) to get frequency domain data.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`fftSize`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long)

The size of the FFT used for frequency-domain analysis (in sample-frames). This MUST be a power of two in the range 32 to 32768, otherwise an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown. The default value is 2048. Note that large FFT sizes can be costly to compute.

If the `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` is changed to a different value, then all state associated with smoothing of the frequency data (for `[getByteFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata)` and `[getFloatFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata)`) is reset. That is the [previous block](https://www.w3.org/TR/webaudio/#previous-block), X^−1\[k\], used for [smoothing over time](https://www.w3.org/TR/webaudio/#smoothing-over-time) is set to 0 for all k.

Note that increasing `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` does mean that the [current time-domain data](https://www.w3.org/TR/webaudio/#current-time-domain-data) must be expanded to include past frames that it previously did not. This means that the `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` effectively MUST keep around the last 32768 sample-frames and the [current time-domain data](https://www.w3.org/TR/webaudio/#current-time-domain-data) is the most recent `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` sample-frames out of that.

[AnalyserNode/frequencyBinCount](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/frequencyBinCount "The frequencyBinCount read-only property of the AnalyserNode interface is an unsigned integer half that of the AnalyserNode.fftSize. This generally equates to the number of data values you will have to play with for the visualization.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`frequencyBinCount`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

Half the FFT size.

[AnalyserNode/maxDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/maxDecibels "The maxDecibels property of the AnalyserNode interface is a double value representing the maximum power value in the scaling range for the FFT analysis data, for conversion to unsigned byte values — basically, this specifies the maximum value for the range of results when using getByteFrequencyData().")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`maxDecibels`, of type [double](https://heycam.github.io/webidl/#idl-double)

`[maxDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-maxdecibels)` is the maximum power value in the scaling range for the FFT analysis data for conversion to unsigned byte values. The default value is -30. If the value of this attribute is set to a value less than or equal to `[minDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-mindecibels)`, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

[AnalyserNode/minDecibels](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels "The minDecibels property of the AnalyserNode interface is a double value representing the minimum power value in the scaling range for the FFT analysis data, for conversion to unsigned byte values — basically, this specifies the minimum value for the range of results when using getByteFrequencyData().")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`minDecibels`, of type [double](https://heycam.github.io/webidl/#idl-double)

`[minDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-mindecibels)` is the minimum power value in the scaling range for the FFT analysis data for conversion to unsigned byte values. The default value is -100. If the value of this attribute is set to a value more than or equal to `[maxDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-maxdecibels)`, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

[AnalyserNode/smoothingTimeConstant](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant "The smoothingTimeConstant property of the AnalyserNode interface is a double value representing the averaging constant with the last analysis frame. It's basically an average between the current buffer and the last buffer the AnalyserNode processed, and results in a much smoother set of value changes over time.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`smoothingTimeConstant`, of type [double](https://heycam.github.io/webidl/#idl-double)

A value from 0 -> 1 where 0 represents no time averaging with the last analysis frame. The default value is 0.8. If the value of this attribute is set to a value less than 0 or more than 1, an `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown.

#### 1.8.3. Methods[](https://www.w3.org/TR/webaudio/#AnalyserNode-methods)

[AnalyserNode/getByteFrequencyData](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteFrequencyData "The getByteFrequencyData() method of the AnalyserNode interface copies the current frequency data into a Uint8Array (unsigned byte array) passed into it.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`getByteFrequencyData(array)`

Get a [reference to the bytes](https://heycam.github.io/webidl/#dfn-get-buffer-source-reference) held by the `[Uint8Array](https://heycam.github.io/webidl/#idl-Uint8Array)` passed as an argument. Copies the [current frequency data](https://www.w3.org/TR/webaudio/#current-frequency-data) to those bytes. If the array has fewer elements than the `[frequencyBinCount](https://www.w3.org/TR/webaudio/#dom-analysernode-frequencybincount)`, the excess elements will be dropped. If the array has more elements than the `[frequencyBinCount](https://www.w3.org/TR/webaudio/#dom-analysernode-frequencybincount)`, the excess elements will be ignored. The most recent `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` frames are used in computing the frequency data.

If another call to `[getByteFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata)` or `[getFloatFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata)` occurs within the same [render quantum](https://www.w3.org/TR/webaudio/#render-quantum) as a previous call, the [current frequency data](https://www.w3.org/TR/webaudio/#current-frequency-data) is not updated with the same data. Instead, the previously computed data is returned.

The values stored in the unsigned byte array are computed in the following way. Let Y\[k\] be the [current frequency data](https://www.w3.org/TR/webaudio/#current-frequency-data) as described in [FFT windowing and smoothing](https://www.w3.org/TR/webaudio/#fft-windowing-and-smoothing-over-time). Then the byte value, b\[k\], is

b\[k\]\=⌊255dBmax−dBmin(Y\[k\]−dBmin)⌋

where dBmin is `[minDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-mindecibels)` and dBmax is `` `[maxDecibels](https://www.w3.org/TR/webaudio/#dom-analysernode-maxdecibels)` ``. If b\[k\] lies outside the range of 0 to 255, b\[k\] is clipped to lie in that range.

Arguments for the [AnalyserNode.getByteFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata) method.

Parameter

Type

Nullable

Optional

Description

`array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata-array)

Uint8Array

✘

✘

This parameter is where the frequency-domain analysis data will be copied.

[AnalyserNode/getByteTimeDomainData](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData "The getByteTimeDomainData() method of the AnalyserNode Interface copies the current waveform, or time-domain, data into a Uint8Array (unsigned byte array) passed into it.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`getByteTimeDomainData(array)`

Get a [reference to the bytes](https://heycam.github.io/webidl/#dfn-get-buffer-source-reference) held by the `[Uint8Array](https://heycam.github.io/webidl/#idl-Uint8Array)` passed as an argument. Copies the [current time-domain data](https://www.w3.org/TR/webaudio/#current-time-domain-data) (waveform data) into those bytes. If the array has fewer elements than the value of `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)`, the excess elements will be dropped. If the array has more elements than `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)`, the excess elements will be ignored. The most recent `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` frames are used in computing the byte data.

The values stored in the unsigned byte array are computed in the following way. Let x\[k\] be the time-domain data. Then the byte value, b\[k\], is

b\[k\]\=⌊128(1+x\[k\])⌋.

If b\[k\] lies outside the range 0 to 255, b\[k\] is clipped to lie in that range.

Arguments for the [AnalyserNode.getByteTimeDomainData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytetimedomaindata) method.

Parameter

Type

Nullable

Optional

Description

`array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytetimedomaindata-array)

Uint8Array

✘

✘

This parameter is where the time-domain sample data will be copied.

[AnalyserNode/getFloatFrequencyData](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatFrequencyData "The getFloatFrequencyData() method of the AnalyserNode Interface copies the current frequency data into a Float32Array array passed into it.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`getFloatFrequencyData(array)`

Get a [reference to the bytes](https://heycam.github.io/webidl/#dfn-get-buffer-source-reference) held by the `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` passed as an argument. Copies the [current frequency data](https://www.w3.org/TR/webaudio/#current-frequency-data) into those bytes. If the array has fewer elements than the `[frequencyBinCount](https://www.w3.org/TR/webaudio/#dom-analysernode-frequencybincount)`, the excess elements will be dropped. If the array has more elements than the `[frequencyBinCount](https://www.w3.org/TR/webaudio/#dom-analysernode-frequencybincount)`, the excess elements will be ignored. The most recent `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` frames are used in computing the frequency data.

If another call to `[getFloatFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata)` or `[getByteFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getbytefrequencydata)` occurs within the same [render quantum](https://www.w3.org/TR/webaudio/#render-quantum) as a previous call, the [current frequency data](https://www.w3.org/TR/webaudio/#current-frequency-data) is not updated with the same data. Instead, the previously computed data is returned.

The frequency data are in dB units.

Arguments for the [AnalyserNode.getFloatFrequencyData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata) method.

Parameter

Type

Nullable

Optional

Description

`array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloatfrequencydata-array)

Float32Array

✘

✘

This parameter is where the frequency-domain analysis data will be copied.

[AnalyserNode/getFloatTimeDomainData](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getFloatTimeDomainData "The getFloatTimeDomainData() method of the AnalyserNode Interface copies the current waveform, or time-domain, data into a Float32Array array passed into it.")

Firefox25+SafariNoneChrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariNoneChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`getFloatTimeDomainData(array)`

Get a [reference to the bytes](https://heycam.github.io/webidl/#dfn-get-buffer-source-reference) held by the `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` passed as an argument. Copies the [current time-domain data](https://www.w3.org/TR/webaudio/#current-time-domain-data) (waveform data) into those bytes. If the array has fewer elements than the value of `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)`, the excess elements will be dropped. If the array has more elements than `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)`, the excess elements will be ignored. The most recent `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` frames are returned (after downmixing).

Arguments for the [AnalyserNode.getFloatTimeDomainData()](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloattimedomaindata) method.

Parameter

Type

Nullable

Optional

Description

`array`[](https://www.w3.org/TR/webaudio/#dom-analysernode-getfloattimedomaindata-array)

Float32Array

✘

✘

This parameter is where the time-domain sample data will be copied.

#### 1.8.4. `[AnalyserOptions](https://www.w3.org/TR/webaudio/#dictdef-analyseroptions)`[](https://www.w3.org/TR/webaudio/#AnalyserOptions)

This specifies the options to be used when constructing an `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)`. All members are optional; if not specified, the normal default values are used to construct the node.

dictionary `AnalyserOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [fftSize](https://www.w3.org/TR/webaudio/#dom-analyseroptions-fftsize) = 2048;
[double](https://heycam.github.io/webidl/#idl-double) [maxDecibels](https://www.w3.org/TR/webaudio/#dom-analyseroptions-maxdecibels) = -30;
[double](https://heycam.github.io/webidl/#idl-double) [minDecibels](https://www.w3.org/TR/webaudio/#dom-analyseroptions-mindecibels) = -100;
[double](https://heycam.github.io/webidl/#idl-double) [smoothingTimeConstant](https://www.w3.org/TR/webaudio/#dom-analyseroptions-smoothingtimeconstant) = 0.8;
};

##### 1.8.4.1. Dictionary `[AnalyserOptions](https://www.w3.org/TR/webaudio/#dictdef-analyseroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-analyseroptions-members)

`fftSize`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `2048`

The desired initial size of the FFT for frequency-domain analysis.

`maxDecibels`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `-30`

The desired initial maximum power in dB for FFT analysis.

`minDecibels`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `-100`

The desired initial minimum power in dB for FFT analysis.

`smoothingTimeConstant`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `0.8`

The desired initial smoothing constant for the FFT analysis.

#### 1.8.5. Time-Domain Down-Mixing[](https://www.w3.org/TR/webaudio/#time-domain-down-mixing)

When the current time-domain data are computed, the input signal must be [down-mixed](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) to mono as if `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` is 1, `[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionode-channelcountmode)` is "`[max](https://www.w3.org/TR/webaudio/#dom-channelcountmode-max)`" and `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` is "`[speakers](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-speakers)`". This is independent of the settings for the `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` itself. The most recent `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` frames are used for the down-mixing operation.

#### 1.8.6. FFT Windowing and Smoothing over Time[](https://www.w3.org/TR/webaudio/#fft-windowing-and-smoothing-over-time)

When the current frequency data are computed, the following operations are to be performed:

In the following, let N be the value of the `[fftSize](https://www.w3.org/TR/webaudio/#dom-analysernode-fftsize)` attribute of this `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)`.

Applying a Blackman window consists in the following operation on the input time domain data. Let x\[n\] for n\=0,…,N−1 be the time domain data. The Blackman window is defined by

α\=0.16a0\=1−α2a1\=12a2\=α2w\[n\]\=a0−a1cos⁡2πnN+a2cos⁡4πnN, for n\=0,…,N−1

The windowed signal x^\[n\] is

x^\[n\]\=x\[n\]w\[n\], for n\=0,…,N−1

Applying a Fourier transform consists of computing the Fourier transform in the following way. Let X\[k\] be the complex frequency domain data and x^\[n\] be the windowed time domain data computed above. Then

X\[k\]\=1N∑n\=0N−1x^\[n\]WN−kn

for k\=0,…,N/2−1 where WN\=e2πi/N.

Smoothing over time frequency data consists in the following operation:

- Let X^−1\[k\] be the result of this operation on the [previous block](https://www.w3.org/TR/webaudio/#previous-block). The previous block is defined as being the buffer computed by the previous [smoothing over time](https://www.w3.org/TR/webaudio/#smoothing-over-time) operation, or an array of N zeros if this is the first time we are [smoothing over time](https://www.w3.org/TR/webaudio/#smoothing-over-time).
- Let τ be the value of the `[smoothingTimeConstant](https://www.w3.org/TR/webaudio/#dom-analysernode-smoothingtimeconstant)` attribute for this `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)`.
- Let X\[k\] be the result of [applying a Fourier transform](https://www.w3.org/TR/webaudio/#fourier-transform) of the current block.

Then the smoothed value, X^\[k\], is computed by

X^\[k\]\=τX^−1\[k\]+(1−τ)|X\[k\]|

for k\=0,…,N−1.

### 1.9. The `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` Interface[](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode)

[AudioBufferSourceNode/AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/AudioBufferSourceNode "The AudioBufferSourceNode() constructor creates a new AudioBufferSourceNode object instance.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode "The AudioBufferSourceNode interface is an AudioScheduledSourceNode which represents an audio source consisting of in-memory audio data, stored in an AudioBuffer. It's especially useful for playing back audio which has particularly stringent timing accuracy requirements, such as for sounds that must match a specific rhythm and can be kept in memory rather than being played from disk or the network.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

This interface represents an audio source from an in-memory audio asset in an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`. It is useful for playing audio assets which require a high degree of scheduling flexibility and accuracy. If sample-accurate playback of network- or disk-backed assets is required, an implementer should use `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` to implement playback.

The `[start()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start)` method is used to schedule when sound playback will happen. The `[start()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start)` method may not be issued multiple times. The playback will stop automatically when the buffer’s audio data has been completely played (if the `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` attribute is `false`), or when the `[stop()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop)` method has been called and the specified time has been reached. Please see more details in the `[start()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start)` and `[stop()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop)` descriptions.

The number of channels of the output equals the number of channels of the AudioBuffer assigned to the `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` attribute, or is one channel of silence if `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` is `null`.

In addition, if the buffer has more than one channel, then the `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` output must change to a single channel of silence at the beginning of a render quantum after the time at which any one of the following conditions holds:

- the end of the `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` has been reached;
- the `[duration](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-duration)` has been reached;
- the `[stop](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop-when-when)` time has been reached.

A playhead position for an `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` is defined as any quantity representing a time offset in seconds, relative to the time coordinate of the first sample frame in the buffer. Such values are to be considered independently from the node’s `playbackRate` and `[detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-detune)` parameters. In general, playhead positions may be subsample-accurate and need not refer to exact sample frame positions. They may assume valid values between 0 and the duration of the buffer.

The `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` and `[detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-detune)` attributes form a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter). They are used together to determine a computedPlaybackRate value:

computedPlaybackRate(t) = playbackRate(t) \* pow(2, detune(t) / 1200)

The [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) for this [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) is (−∞,∞).

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`s are created with an internal boolean slot `[[buffer set]]`, initially set to false.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioBufferSourceNode` : [AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-audiobuffersourcenode-context-options-context),
optional [AudioBufferSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-audiobuffersourceoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-audiobuffersourcenode-context-options-options) = {});
attribute [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)? [buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-detune);
attribute [boolean](https://heycam.github.io/webidl/#idl-boolean) [loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop);
attribute [double](https://heycam.github.io/webidl/#idl-double) [loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart);
attribute [double](https://heycam.github.io/webidl/#idl-double) [loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [start](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start) (optional [double](https://heycam.github.io/webidl/#idl-double) [when](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-when) = 0,
optional [double](https://heycam.github.io/webidl/#idl-double) [offset](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-offset),
optional [double](https://heycam.github.io/webidl/#idl-double) [duration](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-duration));
};

#### 1.9.1. Constructors[](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode-constructors)

`AudioBufferSourceNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-constructor-audiobuffersourcenode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.9.2. Attributes[](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode-attributes)

[AudioBufferSourceNode/buffer](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/buffer "The buffer property of the AudioBufferSourceNode interface provides the ability to play back audio using an AudioBuffer as the source of the sound data.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`buffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), nullable

Represents the audio asset to be played.

[AudioBufferSourceNode/detune](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/detune "The detune property of the AudioBufferSourceNode interface is a k-rate AudioParam representing detuning of oscillation in cents.")

Firefox40+SafariNoneChrome44+

---

Opera31+Edge79+

---

Edge (Legacy)13+IENone

---

Firefox for Android40+iOS SafariNoneChrome for Android44+Android WebView44+Samsung Internet4.0+Opera Mobile32+

`detune`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

An additional parameter, in cents, to modulate the speed at which is rendered the audio stream. This parameter is a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) with `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` to form a [computedPlaybackRate](https://www.w3.org/TR/webaudio/#computedplaybackrate).

[AudioBufferSourceNode/loop](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loop "The loop property of the AudioBufferSourceNode interface is a Boolean indicating if the audio asset must be replayed when the end of the AudioBuffer is reached.")

In all current engines.

Firefox25+Safari6+Chrome15+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`loop`, of type [boolean](https://heycam.github.io/webidl/#idl-boolean)

Indicates if the region of audio data designated by `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` and `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` should be played continuously in a loop. The default value is `false`.

[AudioBufferSourceNode/loopEnd](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loopEnd "The loopEnd property of the AudioBufferSourceNode interface specifies is a floating point number specifying, in seconds, at what offset into playing the AudioBuffer playback should loop back to the time indicated by the loopStart property. This is only used if the loop property is true.")

In all current engines.

Firefox25+Safari6+Chrome24+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`loopEnd`, of type [double](https://heycam.github.io/webidl/#idl-double)

An optional [playhead position](https://www.w3.org/TR/webaudio/#playhead-position) where looping should end if the `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` attribute is true. Its value is exclusive of the content of the loop. Its default `value` is 0, and it may usefully be set to any value between 0 and the duration of the buffer. If `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` is less than or equal to 0, or if `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` is greater than the duration of the buffer, looping will end at the end of the buffer.

[AudioBufferSourceNode/loopStart](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/loopStart "The loopStart property of the AudioBufferSourceNode interface is a floating-point value indicating, in seconds, where in the AudioBuffer the restart of the play must happen.")

In all current engines.

Firefox25+Safari6+Chrome24+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`loopStart`, of type [double](https://heycam.github.io/webidl/#idl-double)

An optional [playhead position](https://www.w3.org/TR/webaudio/#playhead-position) where looping should begin if the `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` attribute is true. Its default `value` is 0, and it may usefully be set to any value between 0 and the duration of the buffer. If `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` is less than 0, looping will begin at 0. If `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` is greater than the duration of the buffer, looping will begin at the end of the buffer.

[AudioBufferSourceNode/playbackRate](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/playbackRate "The playbackRate property of the AudioBufferSourceNode interface Is a k-rate AudioParam that defines the speed at which the audio asset will be played.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`playbackRate`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The speed at which to render the audio stream. This is a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) with `[detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-detune)` to form a [computedPlaybackRate](https://www.w3.org/TR/webaudio/#computedplaybackrate).

#### 1.9.3. Methods[](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode-methods)

[AudioBufferSourceNode/start](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start "The start() method of the AudioBufferSourceNode Interface is used to schedule playback of the audio data contained in the buffer, or to begin playback immediately.")

In all current engines.

Firefox25+Safari6.1+Chrome24+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari7+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`start(when, offset, duration)`

Schedules a sound to playback at an exact time.

Arguments for the [AudioBufferSourceNode.start(when, offset, duration)](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start) method.

Parameter

Type

Nullable

Optional

Description

`when`

double

✘

✔

The `when` parameter describes at what time (in seconds) the sound should start playing. It is in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute. If 0 is passed in for this value or if the value is less than **currentTime**, then the sound will start playing immediately. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `when` is negative.

`offset`

double

✘

✔

The `offset` parameter supplies a [playhead position](https://www.w3.org/TR/webaudio/#playhead-position) where playback will begin. If 0 is passed in for this value, then playback will start from the beginning of the buffer. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `offset` is negative. If `offset` is greater than `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)`, `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` is positive or zero, and `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` is `true`, playback will begin at `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)`. If `offset` is greater than `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)`, `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` is negative, and `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` is `true`, playback will begin at `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)`. `offset` is silently clamped to \[0, `duration`\], when `startTime` is reached, where `duration` is the value of the `duration` attribute of the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` set to the `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` attribute of this `AudioBufferSourceNode`.

`duration`

double

✘

✔

The `[duration](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-duration)` parameter describes the duration of sound to be played, expressed as seconds of total buffer content to be output, including any whole or partial loop iterations. The units of `[duration](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-duration)` are independent of the effects of `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)`. For example, a `[duration](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start-when-offset-duration-duration)` of 5 seconds with a playback rate of 0.5 will output 5 seconds of buffer content at half speed, producing 10 seconds of audible output. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if `duration` is negative.

#### 1.9.4. `[AudioBufferSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-audiobuffersourceoptions)`[](https://www.w3.org/TR/webaudio/#AudioBufferSourceOptions)

This specifies options for constructing a `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`. All members are optional; if not specified, the normal default is used in constructing the node.

dictionary `AudioBufferSourceOptions` {
[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)? [buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-buffer);
[float](https://heycam.github.io/webidl/#idl-float) [detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-detune) = 0;
[boolean](https://heycam.github.io/webidl/#idl-boolean) [loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-loop) = false;
[double](https://heycam.github.io/webidl/#idl-double) [loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-loopend) = 0;
[double](https://heycam.github.io/webidl/#idl-double) [loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-loopstart) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-playbackrate) = 1;
};

##### 1.9.4.1. Dictionary `[AudioBufferSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-audiobuffersourceoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audiobuffersourceoptions-members)

`buffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), nullable

The audio asset to be played. This is equivalent to assigning `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourceoptions-buffer)` to the `[buffer](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-buffer)` attribute of the `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`.

`detune`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial value for the `[detune](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-detune)` AudioParam.

`loop`, of type [boolean](https://heycam.github.io/webidl/#idl-boolean), defaulting to `false`

The initial value for the `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` attribute.

`loopEnd`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `0`

The initial value for the `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` attribute.

`loopStart`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `0`

The initial value for the `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` attribute.

`playbackRate`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `1`

The initial value for the `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` AudioParam.

#### 1.9.5. Looping[](https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode)

_This section is non-normative. Please see [the playback algorithm](https://www.w3.org/TR/webaudio/#playback-AudioBufferSourceNode) for normative requirements._

Setting the `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` attribute to true causes playback of the region of the buffer defined by the endpoints `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` and `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` to continue indefinitely, once any part of the looped region has been played. While `[loop](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loop)` remains true, looped playback will continue until one of the following occurs:

- `[stop()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-stop)` is called,
- the scheduled stop time has been reached,
- the `duration` has been exceeded, if `[start()](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start)` was called with a `duration` value.

The body of the loop is considered to occupy a region from `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` up to, but not including, `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)`. The direction of playback of the looped region respects the sign of the node’s playback rate. For positive playback rates, looping occurs from `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` to `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)`; for negative rates, looping occurs from `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` to `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)`.

Looping does not affect the interpretation of the `offset` argument of `[start()](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start)`. Playback always starts at the requested offset, and looping only begins once the body of the loop is encountered during playback.

The effective loop start and end points are required to lie within the range of zero and the buffer duration, as specified in the algorithm below. `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` is further constrained to be at or after `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)`. If any of these constraints are violated, the loop is considered to include the entire buffer contents.

Loop endpoints have subsample accuracy. When endpoints do not fall on exact sample frame offsets, or when the playback rate is not equal to 1, playback of the loop is interpolated to splice the beginning and end of the loop together just as if the looped audio occurred in sequential, non-looped regions of the buffer.

Loop-related properties may be varied during playback of the buffer, and in general take effect on the next rendering quantum. The exact results are defined by the normative playback algorithm which follows.

The default values of the `[loopStart](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopstart)` and `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` attributes are both 0. Since a `[loopEnd](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-loopend)` value of zero is equivalent to the length of the buffer, the default endpoints cause the entire buffer to be included in the loop.

Note that the values of the loop endpoints are expressed as time offsets in terms of the sample rate of the buffer, meaning that these values are independent of the node’s `[playbackRate](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-playbackrate)` parameter which can vary dynamically during the course of playback.

#### 1.9.6. Playback of AudioBuffer Contents[](https://www.w3.org/TR/webaudio/#playback-AudioBufferSourceNode)

This normative section specifies the playback of the contents of the buffer, accounting for the fact that playback is influenced by the following factors working in combination:

- A starting offset, which can be expressed with sub-sample precision.
- Loop points, which can be expressed with sub-sample precision and can vary dynamically during playback.
- Playback rate and detuning parameters, which combine to yield a single [computedPlaybackRate](https://www.w3.org/TR/webaudio/#computedplaybackrate) that can assume finite values which may be positive or negative.

The algorithm to be followed internally to generate output from an `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` conforms to the following principles:

- Resampling of the buffer may be performed arbitrarily by the UA at any desired point to increase the efficiency or quality of the output.
- Sub-sample start offsets or loop points may require additional interpolation between sample frames.
- The playback of a looped buffer should behave identically to an unlooped buffer containing consecutive occurrences of the looped audio content, excluding any effects from interpolation.

The description of the algorithm is as follows:

let buffer; // AudioBuffer employed by this nodelet context; // AudioContext employed by this node// The following variables capture attribute and AudioParam values for the node.// They are updated on a k-rate basis, prior to each invocation of process().let loop;let detune;let loopStart;let loopEnd;let playbackRate;// Variables for the node’s playback parameterslet start \= 0, offset \= 0, duration \= Infinity; // Set by start()let stop \= Infinity; // Set by stop()// Variables for tracking node’s playback statelet bufferTime \= 0, started \= false, enteredLoop \= false;let bufferTimeElapsed \= 0;let dt \= 1 / context.sampleRate;// Handle invocation of start method callfunction handleStart(when, pos, dur) { if (arguments.length \>= 1) { start \= when; } offset \= pos; if (arguments.length \>= 3) { duration \= dur; }}// Handle invocation of stop method callfunction handleStop(when) { if (arguments.length \>= 1) { stop \= when; } else { stop \= context.currentTime; }}// Interpolate a multi-channel signal value for some sample frame.// Returns an array of signal values.function playbackSignal(position) { /\* This function provides the playback signal function for buffer, which is a function that maps from a playhead position to a set of output signal values, one for each output channel. If |position| corresponds to the location of an exact sample frame in the buffer, this function returns that frame. Otherwise, its return value is determined by a UA-supplied algorithm that interpolates sample frames in the neighborhood of |position|. If |position| is greater than or equal to |loopEnd| and there is no subsequent sample frame in buffer, then interpolation should be based on the sequence of subsequent frames beginning at |loopStart|. \*/ ...}// Generate a single render quantum of audio to be placed// in the channel arrays defined by output. Returns an array// of |numberOfFrames| sample frames to be output.function process(numberOfFrames) { let currentTime \= context.currentTime; // context time of next rendered frame const output \= \[\]; // accumulates rendered sample frames // Combine the two k-rate parameters affecting playback rate const computedPlaybackRate \= playbackRate \* Math.pow(2, detune / 1200); // Determine loop endpoints as applicable let actualLoopStart, actualLoopEnd; if (loop && buffer != null) { if (loopStart \>= 0 && loopEnd \> 0 && loopStart < loopEnd) { actualLoopStart \= loopStart; actualLoopEnd \= Math.min(loopEnd, buffer.duration); } else { actualLoopStart \= 0; actualLoopEnd \= buffer.duration; } } else { // If the loop flag is false, remove any record of the loop having been entered enteredLoop \= false; } // Handle null buffer case if (buffer \== null) { stop \= currentTime; // force zero output for all time } // Render each sample frame in the quantum for (let index \= 0; index < numberOfFrames; index++) { // Check that currentTime and bufferTimeElapsed are // within allowable range for playback if (currentTime < start || currentTime \>= stop || bufferTimeElapsed \>= duration) { output.push(0); // this sample frame is silent currentTime += dt; continue; } if (!started) { // Take note that buffer has started playing and get initial // playhead position. if (loop && computedPlaybackRate \>= 0 && offset \>= actualLoopEnd) { offset \= actualLoopEnd; } if (computedPlaybackRate < 0 && loop && offset < actualLoopStart) { offset \= actualLoopStart; } bufferTime \= offset; started \= true; } // Handle loop-related calculations if (loop) { // Determine if looped portion has been entered for the first time if (!enteredLoop) { if (offset < actualLoopEnd && bufferTime \>= actualLoopStart) { // playback began before or within loop, and playhead is // now past loop start enteredLoop \= true; } if (offset \>= actualLoopEnd && bufferTime < actualLoopEnd) { // playback began after loop, and playhead is now prior // to the loop end enteredLoop \= true; } } // Wrap loop iterations as needed. Note that enteredLoop // may become true inside the preceding conditional. if (enteredLoop) { while (bufferTime \>= actualLoopEnd) { bufferTime \-= actualLoopEnd \- actualLoopStart; } while (bufferTime < actualLoopStart) { bufferTime += actualLoopEnd \- actualLoopStart; } } } if (bufferTime \>= 0 && bufferTime < buffer.duration) { output.push(playbackSignal(bufferTime)); } else { output.push(0); // past end of buffer, so output silent frame } bufferTime += dt \* computedPlaybackRate; bufferTimeElapsed += dt \* computedPlaybackRate; currentTime += dt; } // End of render quantum loop if (currentTime \>= stop) { // End playback state of this node. No further invocations of process() // will occur. Schedule a change to set the number of output channels to 1. } return output;}

The following non-normative figures illustrate the behavior of the algorithm in assorted key scenarios. Dynamic resampling of the buffer is not considered, but as long as the times of loop positions are not changed this does not materially affect the resulting playback. In all figures, the following conventions apply:

- context sample rate is 1000 Hz
- `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` content is shown with the first sample frame at the _x_ origin.
- output signals are shown with the sample frame located at time `start` at the _x_ origin.
- linear interpolation is depicted throughout, although a UA could employ other interpolation techniques.
- the `duration` values noted in the figures refer to the `buffer`, not arguments to `[start()](https://www.w3.org/TR/webaudio/#dom-audiobuffersourcenode-start)`

This figure illustrates basic playback of a buffer, with a simple loop that ends after the last sample frame in the buffer:

![AudioBufferSourceNode basic playback](https://www.w3.org/TR/webaudio/images/absn-basic.png)

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` basic playback

This figure illustrates `playbackRate` interpolation, showing half-speed playback of buffer contents in which every other output sample frame is interpolated. Of particular note is the last sample frame in the looped output, which is interpolated using the loop start point:

![AudioBufferSourceNode playbackRate interpolation](https://www.w3.org/TR/webaudio/images/absn-slow-loop.png)

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` playbackRate interpolation

This figure illustrates sample rate interpolation, showing playback of a buffer whose sample rate is 50% of the context sample rate, resulting in a computed playback rate of 0.5 that corrects for the difference in sample rate between the buffer and the context. The resulting output is the same as the preceding example, but for different reasons.

![AudioBufferSourceNode sample rate interpolation](https://www.w3.org/TR/webaudio/images/absn-half-sample-rate.png)

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` sample rate interpolation.

This figure illustrates subsample offset playback, in which the offset within the buffer begins at exactly half a sample frame. Consequently, every output frame is interpolated:

![AudioBufferSourceNode subsample offset playback](https://www.w3.org/TR/webaudio/images/absn-offset.png)

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` subsample offset playback

This figure illustrates subsample loop playback, showing how fractional frame offsets in the loop endpoints map to interpolated data points in the buffer that respect these offsets as if they were references to exact sample frames:

![AudioBufferSourceNode subsample loop playback](https://www.w3.org/TR/webaudio/images/absn-subsample-loop.png)

`[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` subsample loop playback

### 1.10. The `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` Interface[](https://www.w3.org/TR/webaudio/#AudioDestinationNode)

[AudioDestinationNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode "The AudioDestinationNode interface represents the end destination of an audio graph in a given context — usually the speakers of your device. It can also be the node that will "record" the audio data when used with an OfflineAudioContext.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

This is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` representing the final audio destination and is what the user will ultimately hear. It can often be considered as an audio output device which is connected to speakers. All rendered audio to be heard will be routed to this node, a "terminal" node in the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s routing graph. There is only a single AudioDestinationNode per `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, provided through the `destination` attribute of `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

The output of a `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` is produced by [summing its input](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing), allowing to capture the output of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` into, for example, a `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)`, or a `MediaRecorder` (described in [\[mediastream-recording\]](https://www.w3.org/TR/webaudio/#biblio-mediastream-recording)).

The `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` can be either the destination of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` or `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`, and the channel properties depend on what the context is.

For an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, the defaults are

The `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` can be set to any value less than or equal to `[maxChannelCount](https://www.w3.org/TR/webaudio/#dom-audiodestinationnode-maxchannelcount)`. An `[IndexSizeError](https://heycam.github.io/webidl/#indexsizeerror)` exception MUST be thrown if this value is not within the valid range. Giving a concrete example, if the audio hardware supports 8-channel output, then we may set `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` to 8, and render 8 channels of output.

For an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`, the defaults are

where `numberOfChannels` is the number of channels specified when constructing the `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`. This value may not be changed; a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` exception MUST be thrown if `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` is changed to a different value.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioDestinationNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
readonly attribute [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [maxChannelCount](https://www.w3.org/TR/webaudio/#dom-audiodestinationnode-maxchannelcount);
};

#### 1.10.1. Attributes[](https://www.w3.org/TR/webaudio/#AudioDestinationNode-attributes)

[AudioDestinationNode/maxChannelCount](https://developer.mozilla.org/en-US/docs/Web/API/AudioDestinationNode/maxChannelCount "The maxchannelCount property of the AudioDestinationNode interface is an unsigned long defining the maximum amount of channels that the physical device can handle.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`maxChannelCount`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), readonly

The maximum number of channels that the `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionode-channelcount)` attribute can be set to. An `[AudioDestinationNode](https://www.w3.org/TR/webaudio/#audiodestinationnode)` representing the audio hardware end-point (the normal case) can potentially output more than 2 channels of audio if the audio hardware is multi-channel. `[maxChannelCount](https://www.w3.org/TR/webaudio/#dom-audiodestinationnode-maxchannelcount)` is the maximum number of channels that this hardware is capable of supporting.

### 1.11. The `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` Interface[](https://www.w3.org/TR/webaudio/#AudioListener)

This interface represents the position and orientation of the person listening to the audio scene. All `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` objects spatialize in relation to the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s `[listener](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-listener)`. See [§ 6 Spatialization/Panning](https://www.w3.org/TR/webaudio/#Spatialization) for more details about spatialization.

The `[positionX](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionx)`, `[positionY](https://www.w3.org/TR/webaudio/#dom-audiolistener-positiony)`, and `[positionZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionz)` parameters represent the location of the listener in 3D Cartesian coordinate space. `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` objects use this position relative to individual audio sources for spatialization.

The `[forwardX](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardx)`, `[forwardY](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardy)`, and `[forwardZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardz)` parameters represent a direction vector in 3D space. Both a `forward` vector and an `up` vector are used to determine the orientation of the listener. In simple human terms, the `forward` vector represents which direction the person’s nose is pointing. The `up` vector represents the direction the top of a person’s head is pointing. These two vectors are expected to be linearly independent. For normative requirements of how these values are to be interpreted, see the [§ 6 Spatialization/Panning](https://www.w3.org/TR/webaudio/#Spatialization) section.

[AudioListener](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener "The AudioListener interface represents the position and orientation of the unique person listening to the audio scene, and is used in audio spatialization. All PannerNodes spatialize in relation to the AudioListener stored in the BaseAudioContext.listener attribute.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioListener` {
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [positionX](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionx);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [positionY](https://www.w3.org/TR/webaudio/#dom-audiolistener-positiony);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [positionZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionz);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [forwardX](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardx);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [forwardY](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardy);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [forwardZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardz);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [upX](https://www.w3.org/TR/webaudio/#dom-audiolistener-upx);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [upY](https://www.w3.org/TR/webaudio/#dom-audiolistener-upy);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [upZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-upz);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [setPosition](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition) ([float](https://heycam.github.io/webidl/#idl-float) `x`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition-x-y-z-x), [float](https://heycam.github.io/webidl/#idl-float) `y`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition-x-y-z-y), [float](https://heycam.github.io/webidl/#idl-float) `z`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition-x-y-z-z));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [setOrientation](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation) ([float](https://heycam.github.io/webidl/#idl-float) `x`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x-y-z-xup-yup-zup-x), [float](https://heycam.github.io/webidl/#idl-float) `y`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x-y-z-xup-yup-zup-y), [float](https://heycam.github.io/webidl/#idl-float) `z`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x-y-z-xup-yup-zup-z), [float](https://heycam.github.io/webidl/#idl-float) `xUp`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x-y-z-xup-yup-zup-xup), [float](https://heycam.github.io/webidl/#idl-float) `yUp`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x-y-z-xup-yup-zup-yup), [float](https://heycam.github.io/webidl/#idl-float) `zUp`[](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x-y-z-xup-yup-zup-zup));
};

#### 1.11.1. Attributes[](https://www.w3.org/TR/webaudio/#AudioListener-attributes)

[AudioListener/forwardX](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/forwardX "The forwardX read-only property of the AudioListener interface is an AudioParam representing the x value of the direction vector defining the forward direction the listener is pointing in.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`forwardX`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the x coordinate component of the forward direction the listener is pointing in 3D Cartesian coordinate space.

[AudioListener/forwardY](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/forwardY "The forwardY read-only property of the AudioListener interface is an AudioParam representing the y value of the direction vector defining the forward direction the listener is pointing in.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`forwardY`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the y coordinate component of the forward direction the listener is pointing in 3D Cartesian coordinate space.

[AudioListener/forwardZ](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/forwardZ "The forwardZ read-only property of the AudioListener interface is an AudioParam representing the z value of the direction vector defining the forward direction the listener is pointing in.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`forwardZ`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the z coordinate component of the forward direction the listener is pointing in 3D Cartesian coordinate space.

[AudioListener/positionX](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/positionX "The positionX read-only property of the AudioListener interface is an AudioParam representing the x position of the listener in 3D cartesian space.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`positionX`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the x coordinate position of the audio listener in a 3D Cartesian coordinate space.

[AudioListener/positionY](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/positionY "The positionY read-only property of the AudioListener interface is an AudioParam representing the y position of the listener in 3D cartesian space.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`positionY`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the y coordinate position of the audio listener in a 3D Cartesian coordinate space.

[AudioListener/positionZ](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/positionZ "The positionZ read-only property of the AudioListener interface is an AudioParam representing the z position of the listener in 3D cartesian space.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`positionZ`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the z coordinate position of the audio listener in a 3D Cartesian coordinate space.

[AudioListener/upX](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/upX "The upX read-only property of the AudioListener interface is an AudioParam representing the x value of the direction vector defining the up direction the listener is pointing in.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`upX`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the x coordinate component of the up direction the listener is pointing in 3D Cartesian coordinate space.

[AudioListener/upY](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/upY "The upY read-only property of the AudioListener interface is an AudioParam representing the y value of the direction vector defining the up direction the listener is pointing in.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`upY`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the y coordinate component of the up direction the listener is pointing in 3D Cartesian coordinate space.

[AudioListener/upZ](https://developer.mozilla.org/en-US/docs/Web/API/AudioListener/upZ "The upZ read-only property of the AudioListener interface is an AudioParam representing the z value of the direction vector defining the up direction the listener is pointing in.")

In only one current engine.

FirefoxNoneSafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`upZ`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the z coordinate component of the up direction the listener is pointing in 3D Cartesian coordinate space.

#### 1.11.2. Methods[](https://www.w3.org/TR/webaudio/#AudioListener-methods)

`setOrientation(x, y, z, xUp, yUp, zUp)`

This method is DEPRECATED. It is equivalent to setting `[forwardX](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardx)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[forwardY](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardy)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[forwardZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardz)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[upX](https://www.w3.org/TR/webaudio/#dom-audiolistener-upx)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[upY](https://www.w3.org/TR/webaudio/#dom-audiolistener-upy)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, and `[upZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-upz)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` directly with the given `x`, `y`, `z`, `xUp`, `yUp`, and `zUp` values, respectively.

Consequently, if any of the `[forwardX](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardx)`, `[forwardY](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardy)`, `[forwardZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-forwardz)`, `[upX](https://www.w3.org/TR/webaudio/#dom-audiolistener-upx)`, `[upY](https://www.w3.org/TR/webaudio/#dom-audiolistener-upy)` and `[upZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-upz)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s have an automation curve set using `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)` at the time this method is called, a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` MUST be thrown.

`[setOrientation()](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation)` describes which direction the listener is pointing in the 3D cartesian coordinate space. Both a [forward](https://www.w3.org/TR/webaudio/#audiolistener-forward) vector and an [up](https://www.w3.org/TR/webaudio/#audiolistener-up) vector are provided. In simple human terms, the forward vector represents which direction the person’s nose is pointing. The up vector represents the direction the top of a person’s head is pointing. These two vectors are expected to be linearly independent. For normative requirements of how these values are to be interpreted, see the [§ 6 Spatialization/Panning](https://www.w3.org/TR/webaudio/#Spatialization).

The `[x](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-x)`, `[y](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-y)`, and `[z](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-z)` parameters represent a [forward](https://www.w3.org/TR/webaudio/#audiolistener-forward) direction vector in 3D space, with the default value being (0,0,-1).

The `[xUp](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-xup)`, `[yUp](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-yup)`, and `[zUp](https://www.w3.org/TR/webaudio/#dom-audiolistener-setorientation-zup)` parameters represent an [up](https://www.w3.org/TR/webaudio/#audiolistener-up) direction vector in 3D space, with the default value being (0,1,0).

`setPosition(x, y, z)`

This method is DEPRECATED. It is equivalent to setting `[positionX](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionx)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[positionY](https://www.w3.org/TR/webaudio/#dom-audiolistener-positiony)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, and `[positionZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionz)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` directly with the given `x`, `y`, and `z` values, respectively.

Consequently, any of the `[positionX](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionx)`, `[positionY](https://www.w3.org/TR/webaudio/#dom-audiolistener-positiony)`, and `[positionZ](https://www.w3.org/TR/webaudio/#dom-audiolistener-positionz)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s for this `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` have an automation curve set using `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)` at the time this method is called, a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` MUST be thrown.

`[setPosition()](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition)` sets the position of the listener in a 3D cartesian coordinate space. `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` objects use this position relative to individual audio sources for spatialization.

The `[x](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition-x)`, `[y](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition-y)`, and `[z](https://www.w3.org/TR/webaudio/#dom-audiolistener-setposition-z)` parameters represent the coordinates in 3D space.

The default value is (0,0,0).

#### 1.11.3. Processing[](https://www.w3.org/TR/webaudio/#listenerprocessing)

Because `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)`'s parameters can be connected with `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s and they can also affect the output of `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`s in the same graph, the node ordering algorithm should take the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` into consideration when computing the order of processing. For this reason, all the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`s in the graph have the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` as input.

### 1.12. The `[AudioProcessingEvent](https://www.w3.org/TR/webaudio/#audioprocessingevent)` Interface - DEPRECATED[](https://www.w3.org/TR/webaudio/#AudioProcessingEvent)

This is an `[Event](https://dom.spec.whatwg.org/#event)` object which is dispatched to `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` nodes. It will be removed when the ScriptProcessorNode is removed, as the replacement `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` uses a different approach.

The event handler processes audio from the input (if any) by accessing the audio data from the `inputBuffer` attribute. The audio data which is the result of the processing (or the synthesized data if there are no inputs) is then placed into the `[outputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-outputbuffer)`.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioProcessingEvent` : [Event](https://dom.spec.whatwg.org/#event) {
`constructor`[](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-audioprocessingevent) ([DOMString](https://heycam.github.io/webidl/#idl-DOMString) `type`[](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-audioprocessingevent-type-eventinitdict-type), [AudioProcessingEventInit](https://www.w3.org/TR/webaudio/#dictdef-audioprocessingeventinit) `eventInitDict`[](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-audioprocessingevent-type-eventinitdict-eventinitdict));
readonly attribute [double](https://heycam.github.io/webidl/#idl-double) [playbackTime](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-playbacktime);
readonly attribute [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [inputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-inputbuffer);
readonly attribute [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [outputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-outputbuffer);
};

#### 1.12.1. Attributes[](https://www.w3.org/TR/webaudio/#AudioProcessingEvent-attributes)

`inputBuffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), readonly

An AudioBuffer containing the input audio data. It will have a number of channels equal to the `numberOfInputChannels` parameter of the createScriptProcessor() method. This AudioBuffer is only valid while in the scope of the `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` function. Its values will be meaningless outside of this scope.

`outputBuffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), readonly

An AudioBuffer where the output audio data MUST be written. It will have a number of channels equal to the `numberOfOutputChannels` parameter of the createScriptProcessor() method. Script code within the scope of the `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` function is expected to modify the `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` arrays representing channel data in this AudioBuffer. Any script modifications to this AudioBuffer outside of this scope will not produce any audible effects.

`playbackTime`, of type [double](https://heycam.github.io/webidl/#idl-double), readonly

The time when the audio will be played in the same time coordinate system as the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)`.

#### 1.12.2. `[AudioProcessingEventInit](https://www.w3.org/TR/webaudio/#dictdef-audioprocessingeventinit)`[](https://www.w3.org/TR/webaudio/#AudioProcessingEventInit)

dictionary `AudioProcessingEventInit` : [EventInit](https://dom.spec.whatwg.org/#dictdef-eventinit) {
required [double](https://heycam.github.io/webidl/#idl-double) [playbackTime](https://www.w3.org/TR/webaudio/#dom-audioprocessingeventinit-playbacktime);
required [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [inputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingeventinit-inputbuffer);
required [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer) [outputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingeventinit-outputbuffer);
};

##### 1.12.2.1. Dictionary `[AudioProcessingEventInit](https://www.w3.org/TR/webaudio/#dictdef-audioprocessingeventinit)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audioprocessingeventinit-members)

`inputBuffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)

Value to be assigned to the `[inputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-inputbuffer)` attribute of the event.

`outputBuffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)

Value to be assigned to the `[outputBuffer](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-outputbuffer)` attribute of the event.

`playbackTime`, of type [double](https://heycam.github.io/webidl/#idl-double)

Value to be assigned to the `[playbackTime](https://www.w3.org/TR/webaudio/#dom-audioprocessingevent-playbacktime)` attribute of the event.

### 1.13. The `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` Interface[](https://www.w3.org/TR/webaudio/#BiquadFilterNode)

`[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` processor implementing very common low-order filters.

Low-order filters are the building blocks of basic tone controls (bass, mid, treble), graphic equalizers, and more advanced filters. Multiple `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` filters can be combined to form more complex filters. The filter parameters such as `[frequency](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-frequency)` can be changed over time for filter sweeps, etc. Each `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` can be configured as one of a number of common filter types as shown in the IDL below. The default filter type is `"lowpass"`.

Both `[frequency](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-frequency)` and `[detune](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-detune)` form a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) and are both [a-rate](https://www.w3.org/TR/webaudio/#a-rate). They are used together to determine a computedFrequency value:

computedFrequency(t) = frequency(t) \* pow(2, detune(t) / 1200)

The [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) for this [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) is \[0, [Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency)\].

The number of channels of the output always equals the number of channels of the input.

enum `BiquadFilterType` {
["lowpass"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowpass),
["highpass"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highpass),
["bandpass"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-bandpass),
["lowshelf"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowshelf),
["highshelf"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highshelf),
["peaking"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-peaking),
["notch"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-notch),
["allpass"](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-allpass)
};

Enumeration description

"`lowpass`"

A [lowpass filter](https://en.wikipedia.org/wiki/Low-pass_filter) allows frequencies below the cutoff frequency to pass through and attenuates frequencies above the cutoff. It implements a standard second-order resonant lowpass filter with 12dB/octave rolloff.

frequency

The cutoff frequency

[Q](https://en.wikipedia.org/wiki/Q_factor)

Controls how peaked the response will be at the cutoff frequency. A large value makes the response more peaked.

gain

Not used in this filter type

"`highpass`"

A [highpass filter](https://en.wikipedia.org/wiki/High-pass_filter) is the opposite of a lowpass filter. Frequencies above the cutoff frequency are passed through, but frequencies below the cutoff are attenuated. It implements a standard second-order resonant highpass filter with 12dB/octave rolloff.

frequency

The cutoff frequency below which the frequencies are attenuated

[Q](https://en.wikipedia.org/wiki/Q_factor)

Controls how peaked the response will be at the cutoff frequency. A large value makes the response more peaked.

gain

Not used in this filter type

"`bandpass`"

A [bandpass filter](https://en.wikipedia.org/wiki/Band-pass_filter) allows a range of frequencies to pass through and attenuates the frequencies below and above this frequency range. It implements a second-order bandpass filter.

frequency

The center of the frequency band

[Q](https://en.wikipedia.org/wiki/Q_factor)

Controls the width of the band. The width becomes narrower as the Q value increases.

gain

Not used in this filter type

"`lowshelf`"

The lowshelf filter allows all frequencies through, but adds a boost (or attenuation) to the lower frequencies. It implements a second-order lowshelf filter.

frequency

The upper limit of the frequences where the boost (or attenuation) is applied.

[Q](https://en.wikipedia.org/wiki/Q_factor)

Not used in this filter type.

gain

The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.

"`highshelf`"

The highshelf filter is the opposite of the lowshelf filter and allows all frequencies through, but adds a boost to the higher frequencies. It implements a second-order highshelf filter

frequency

The lower limit of the frequences where the boost (or attenuation) is applied.

[Q](https://en.wikipedia.org/wiki/Q_factor)

Not used in this filter type.

gain

The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.

"`peaking`"

The peaking filter allows all frequencies through, but adds a boost (or attenuation) to a range of frequencies.

frequency

The center frequency of where the boost is applied.

[Q](https://en.wikipedia.org/wiki/Q_factor)

Controls the width of the band of frequencies that are boosted. A large value implies a narrow width.

gain

The boost, in dB, to be applied. If the value is negative, the frequencies are attenuated.

"`notch`"

The notch filter (also known as a [band-stop or band-rejection filter](https://en.wikipedia.org/wiki/Band-stop_filter)) is the opposite of a bandpass filter. It allows all frequencies through, except for a set of frequencies.

frequency

The center frequency of where the notch is applied.

[Q](https://en.wikipedia.org/wiki/Q_factor)

Controls the width of the band of frequencies that are attenuated. A large value implies a narrow width.

gain

Not used in this filter type.

"`allpass`"

An [allpass filter](https://en.wikipedia.org/wiki/All-pass_filter#Digital_Implementation) allows all frequencies through, but changes the phase relationship between the various frequencies. It implements a second-order allpass filter

frequency

The frequency where the center of the phase transition occurs. Viewed another way, this is the frequency with maximal [group delay](https://en.wikipedia.org/wiki/Group_delay).

[Q](https://en.wikipedia.org/wiki/Q_factor)

Controls how sharp the phase transition is at the center frequency. A larger value implies a sharper transition and a larger group delay.

gain

Not used in this filter type.

All attributes of the `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` are [a-rate](https://www.w3.org/TR/webaudio/#a-rate) `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s.

[BiquadFilterNode/BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/BiquadFilterNode "The BiquadFilterNode() constructor of the Web Audio API creates a new BiquadFilterNode object, which represents a simple low-order filter, and is created using the AudioContext.createBiquadFilter() method.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[BiquadFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode "The BiquadFilterNode interface represents a simple low-order filter, and is created using the BaseAudioContext/createBiquadFilter method. It is an AudioNode that can represent different kinds of filters, tone control devices, and graphic equalizers.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `BiquadFilterNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-biquadfilternode-context-options-context), optional [BiquadFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-biquadfilteroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-biquadfilternode-context-options-options) = {});
attribute [BiquadFilterType](https://www.w3.org/TR/webaudio/#enumdef-biquadfiltertype) [type](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-type);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [frequency](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-frequency);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [detune](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-detune);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [Q](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [gain](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-gain);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [getFrequencyResponse](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse) ([Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `frequencyHz`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse-frequencyhz-magresponse-phaseresponse-frequencyhz),
[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `magResponse`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse-frequencyhz-magresponse-phaseresponse-magresponse),
[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `phaseResponse`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse-frequencyhz-magresponse-phaseresponse-phaseresponse));
};

#### 1.13.1. Constructors[](https://www.w3.org/TR/webaudio/#BiquadFilterNode-constructors)

`BiquadFilterNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-biquadfilternode-context-options)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.13.2. Attributes[](https://www.w3.org/TR/webaudio/#BiquadFilterNode-attributes)

[BiquadFilterNode/Q](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/Q "The Q property of the BiquadFilterNode interface is an a-rate AudioParam, a double representing a Q factor, or quality factor.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`Q`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The [Q](https://en.wikipedia.org/wiki/Q_factor) factor of the filter.

For `[lowpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowpass)` and `[highpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highpass)` filters the `[Q](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q)` value is interpreted to be in dB. For these filters the nominal range is \[−Qlim,Qlim\] where Qlim is the largest value for which 10Q/20 does not overflow. This is approximately 770.63678.

For the `[bandpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-bandpass)`, `[notch](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-notch)`, `[allpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-allpass)`, and `[peaking](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-peaking)` filters, this value is a linear value. The value is related to the bandwidth of the filter and hence should be a positive value. The nominal range is \[0,3.4028235e38\], the upper limit being the [most-positive-single-float](https://www.w3.org/TR/webaudio/#most-positive-single-float).

This is not used for the `[lowshelf](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowshelf)` and `[highshelf](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highshelf)` filters.

[BiquadFilterNode/detune](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/detune "The detune property of the BiquadFilterNode interface is an a-rate AudioParam representing detuning of the frequency in cents.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`detune`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

A detune value, in cents, for the frequency. It forms a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) with `[frequency](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-frequency)` to form the [computedFrequency](https://www.w3.org/TR/webaudio/#computedfrequency).

[BiquadFilterNode/frequency](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/frequency "The frequency property of the BiquadFilterNode interface Is a a-rate AudioParam, a double representing a frequency in the current filtering algorithm measured in hertz (Hz).")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`frequency`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The frequency at which the `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` will operate, in Hz. It forms a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) with `[detune](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-detune)` to form the [computedFrequency](https://www.w3.org/TR/webaudio/#computedfrequency).

[BiquadFilterNode/gain](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/gain "The gain property of the BiquadFilterNode interface Is a a-rate AudioParam, a double representing the gain used in the current filtering algorithm.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`gain`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The gain of the filter. Its value is in dB units. The gain is only used for `[lowshelf](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowshelf)`, `[highshelf](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highshelf)`, and `[peaking](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-peaking)` filters.

[BiquadFilterNode/type](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/type "The type property of the BiquadFilterNode interface is a string (enum) value defining the kind of filtering algorithm the node is implementing.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`type`, of type [BiquadFilterType](https://www.w3.org/TR/webaudio/#enumdef-biquadfiltertype)

The type of this `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)`. Its default value is "`[lowpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowpass)`". The exact meaning of the other parameters depend on the value of the `[type](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-type)` attribute.

#### 1.13.3. Methods[](https://www.w3.org/TR/webaudio/#BiquadFilterNode-methods)

[BiquadFilterNode/getFrequencyResponse](https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode/getFrequencyResponse "The getFrequencyResponse() method of the BiquadFilterNode interface takes the current filtering algorithm's settings and calculates the frequency response for frequencies specified in a specified array of frequencies.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`getFrequencyResponse(frequencyHz, magResponse, phaseResponse)`

Given the `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)` from each of the filter parameters, synchronously calculates the frequency response for the specified frequencies. The three parameters MUST be `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`s of the same length, or an `[InvalidAccessError](https://heycam.github.io/webidl/#invalidaccesserror)` MUST be thrown.

The frequency response returned MUST be computed with the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` sampled for the current processing block.

Arguments for the [BiquadFilterNode.getFrequencyResponse()](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse) method.

Parameter

Type

Nullable

Optional

Description

`frequencyHz`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse-frequencyhz)

Float32Array

✘

✘

This parameter specifies an array of frequencies, in Hz, at which the response values will be calculated.

`magResponse`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse-magresponse)

Float32Array

✘

✘

This parameter specifies an output array receiving the linear magnitude response values. If a value in the `frequencyHz` parameter is not within \[0, sampleRate/2\], where `sampleRate` is the value of the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` property of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, the corresponding value at the same index of the `magResponse` array MUST be `NaN`.

`phaseResponse`[](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-getfrequencyresponse-phaseresponse)

Float32Array

✘

✘

This parameter specifies an output array receiving the phase response values in radians. If a value in the `frequencyHz` parameter is not within \[0; sampleRate/2\], where `sampleRate` is the value of the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` property of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, the corresponding value at the same index of the `phaseResponse` array MUST be `NaN`.

#### 1.13.4. `[BiquadFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-biquadfilteroptions)`[](https://www.w3.org/TR/webaudio/#BiquadFilterOptions)

This specifies the options to be used when constructing a `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)`. All members are optional; if not specified, the normal default values are used to construct the node.

dictionary `BiquadFilterOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[BiquadFilterType](https://www.w3.org/TR/webaudio/#enumdef-biquadfiltertype) [type](https://www.w3.org/TR/webaudio/#dom-biquadfilteroptions-type) = "lowpass";
[float](https://heycam.github.io/webidl/#idl-float) [Q](https://www.w3.org/TR/webaudio/#dom-biquadfilteroptions-q) = 1;
[float](https://heycam.github.io/webidl/#idl-float) [detune](https://www.w3.org/TR/webaudio/#dom-biquadfilteroptions-detune) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [frequency](https://www.w3.org/TR/webaudio/#dom-biquadfilteroptions-frequency) = 350;
[float](https://heycam.github.io/webidl/#idl-float) [gain](https://www.w3.org/TR/webaudio/#dom-biquadfilteroptions-gain) = 0;
};

##### 1.13.4.1. Dictionary `[BiquadFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-biquadfilteroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-biquadfilteroptions-members)

`Q`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `1`

The desired initial value for `[Q](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q)`.

`detune`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The desired initial value for `[detune](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-detune)`.

`frequency`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `350`

The desired initial value for `[frequency](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-frequency)`.

`gain`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The desired initial value for `[gain](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-gain)`.

`type`, of type [BiquadFilterType](https://www.w3.org/TR/webaudio/#enumdef-biquadfiltertype), defaulting to `"lowpass"`

The desired initial type of the filter.

#### 1.13.5. Filters Characteristics[](https://www.w3.org/TR/webaudio/#filters-characteristics)

There are multiple ways of implementing the type of filters available through the `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` each having very different characteristics. The formulas in this section describe the filters that a [conforming implementation](https://heycam.github.io/webidl/#dfn-conforming-implementation) MUST implement, as they determine the characteristics of the different filter types. They are inspired by formulas found in the [Audio EQ Cookbook](https://webaudio.github.io/Audio-EQ-Cookbook/audio-eq-cookbook.html).

The `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` processes audio with a transfer function of

H(z)\=b0a0+b1a0z−1+b2a0z−21+a1a0z−1+a2a0z−2

which is equivalent to a time-domain equation of:

a0y(n)+a1y(n−1)+a2y(n−2)\=b0x(n)+b1x(n−1)+b2x(n−2)

The initial filter state is 0.

Note: While fixed filters are stable, it is possible to create unstable biquad filters using automations of `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s. It is the developers responsibility to manage this.

Note: The UA may produce a warning to notify the user that NaN values have occurred in the filter state. This is usually indicative of an unstable filter.

The coefficients in the transfer function above are different for each node type. The following intermediate variables are necessary for their computation, based on the [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) of the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s of the `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)`.

- Let Fs be the value of the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` attribute for this `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.
- Let f0 be the value of the [computedFrequency](https://www.w3.org/TR/webaudio/#computedfrequency).
- Let G be the value of the `[gain](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-gain)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`.
- Let Q be the value of the `[Q](https://www.w3.org/TR/webaudio/#dom-biquadfilternode-q)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`.
- Finally let

  A\=10G40ω0\=2πf0FsαQ\=sin⁡ω02QαQdB\=sin⁡ω02⋅10Q/20S\=1αS\=sin⁡ω02(A+1A)(1S−1)+2

The six coefficients (b0,b1,b2,a0,a1,a2) for each filter type, are:

"`[lowpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowpass)`"

b0\=1−cos⁡ω02b1\=1−cos⁡ω0b2\=1−cos⁡ω02a0\=1+αQdBa1\=−2cos⁡ω0a2\=1−αQdB

"`[highpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highpass)`"

b0\=1+cos⁡ω02b1\=−(1+cos⁡ω0)b2\=1+cos⁡ω02a0\=1+αQdBa1\=−2cos⁡ω0a2\=1−αQdB

"`[bandpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-bandpass)`"

b0\=αQb1\=0b2\=−αQa0\=1+αQa1\=−2cos⁡ω0a2\=1−αQ

"`[notch](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-notch)`"

b0\=1b1\=−2cos⁡ω0b2\=1a0\=1+αQa1\=−2cos⁡ω0a2\=1−αQ

"`[allpass](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-allpass)`"

b0\=1−αQb1\=−2cos⁡ω0b2\=1+αQa0\=1+αQa1\=−2cos⁡ω0a2\=1−αQ

"`[peaking](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-peaking)`"

b0\=1+αQAb1\=−2cos⁡ω0b2\=1−αQAa0\=1+αQAa1\=−2cos⁡ω0a2\=1−αQA

"`[lowshelf](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-lowshelf)`"

b0\=A\[(A+1)−(A−1)cos⁡ω0+2αSA)\]b1\=2A\[(A−1)−(A+1)cos⁡ω0)\]b2\=A\[(A+1)−(A−1)cos⁡ω0−2αSA)\]a0\=(A+1)+(A−1)cos⁡ω0+2αSAa1\=−2\[(A−1)+(A+1)cos⁡ω0\]a2\=(A+1)+(A−1)cos⁡ω0−2αSA)

"`[highshelf](https://www.w3.org/TR/webaudio/#dom-biquadfiltertype-highshelf)`"

b0\=A\[(A+1)+(A−1)cos⁡ω0+2αSA)\]b1\=−2A\[(A−1)+(A+1)cos⁡ω0)\]b2\=A\[(A+1)+(A−1)cos⁡ω0−2αSA)\]a0\=(A+1)−(A−1)cos⁡ω0+2αSAa1\=2\[(A−1)−(A+1)cos⁡ω0\]a2\=(A+1)−(A−1)cos⁡ω0−2αSA

### 1.14. The `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` Interface[](https://www.w3.org/TR/webaudio/#ChannelMergerNode)

The `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` is for use in more advanced applications and would often be used in conjunction with `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`.

This interface represents an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for combining channels from multiple audio streams into a single audio stream. It has a variable number of inputs (defaulting to 6), but not all of them need be connected. There is a single output whose audio stream has a number of channels equal to the number of inputs when any of the inputs is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing). If none of the inputs are [actively processing](https://www.w3.org/TR/webaudio/#actively-processing), then output is a single channel of silence.

To merge multiple inputs into one stream, each input gets downmixed into one channel (mono) based on the specified mixing rule. An unconnected input still counts as **one silent channel** in the output. Changing input streams does **not** affect the order of output channels.

[](https://www.w3.org/TR/webaudio/#example-c8345030)For example, if a default `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` has two connected stereo inputs, the first and second input will be downmixed to mono respectively before merging. The output will be a 6-channel stream whose first two channels are be filled with the first two (downmixed) inputs and the rest of channels will be silent.

Also the `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` can be used to arrange multiple audio streams in a certain order for the multi-channel speaker array such as 5.1 surround set up. The merger does not interpret the channel identities (such as left, right, etc.), but simply combines channels in the order that they are input.

![channel merger](https://www.w3.org/TR/webaudio/images/channel-merger.svg)

A diagram of ChannelMerger

[ChannelMergerNode/ChannelMergerNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelMergerNode/ChannelMergerNode "The ChannelMergerNode() constructor creates a new ChannelMergerNode object instance.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[ChannelMergerNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelMergerNode "The ChannelMergerNode interface, often used in conjunction with its opposite, ChannelSplitterNode, reunites different mono inputs into a single output. Each input is used to fill a channel of the output. This is useful for accessing each channels separately, e.g. for performing channel mixing where gain must be separately controlled on each channel.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `ChannelMergerNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-channelmergernode-channelmergernode-context-options-context), optional [ChannelMergerOptions](https://www.w3.org/TR/webaudio/#dictdef-channelmergeroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-channelmergernode-channelmergernode-context-options-options) = {});
};

#### 1.14.1. Constructors[](https://www.w3.org/TR/webaudio/#ChannelMergerNode-constructors)

`ChannelMergerNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-channelmergernode-constructor-channelmergernode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.14.2. `[ChannelMergerOptions](https://www.w3.org/TR/webaudio/#dictdef-channelmergeroptions)`[](https://www.w3.org/TR/webaudio/#ChannelMergerOptions)

dictionary `ChannelMergerOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfInputs](https://www.w3.org/TR/webaudio/#dom-channelmergeroptions-numberofinputs) = 6;
};

##### 1.14.2.1. Dictionary `[ChannelMergerOptions](https://www.w3.org/TR/webaudio/#dictdef-channelmergeroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-channelmergeroptions-members)

`numberOfInputs`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `6`

The number inputs for the `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)`. See `[createChannelMerger()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelmerger)` for constraints on this value.

### 1.15. The `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` Interface[](https://www.w3.org/TR/webaudio/#ChannelSplitterNode)

The `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` is for use in more advanced applications and would often be used in conjunction with `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)`.

This interface represents an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for accessing the individual channels of an audio stream in the routing graph. It has a single input, and a number of "active" outputs which equals the number of channels in the input audio stream. For example, if a stereo input is connected to an `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` then the number of active outputs will be two (one from the left channel and one from the right). There are always a total number of N outputs (determined by the `numberOfOutputs` parameter to the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` method `[createChannelSplitter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelsplitter)`), The default number is 6 if this value is not provided. Any outputs which are not "active" will output silence and would typically not be connected to anything.

![channel splitter](https://www.w3.org/TR/webaudio/images/channel-splitter.png)

A diagram of a ChannelSplitter

Please note that in this example, the splitter does **not** interpret the channel identities (such as left, right, etc.), but simply splits out channels in the order that they are input.

One application for `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)` is for doing "matrix mixing" where individual gain control of each channel is desired.

[ChannelSplitterNode/ChannelSplitterNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelSplitterNode/ChannelSplitterNode "The ChannelSplitterNode() constructor of the Web Audio API creates a new ChannelSplitterNode object instance, representing a node that splits the input into a separate output for each of the source node's audio channels.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[ChannelSplitterNode](https://developer.mozilla.org/en-US/docs/Web/API/ChannelSplitterNode "The ChannelSplitterNode interface, often used in conjunction with its opposite, ChannelMergerNode, separates the different channels of an audio source into a set of mono outputs. This is useful for accessing each channel separately, e.g. for performing channel mixing where gain must be separately controlled on each channel.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `ChannelSplitterNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-channelsplitternode-channelsplitternode-context-options-context), optional [ChannelSplitterOptions](https://www.w3.org/TR/webaudio/#dictdef-channelsplitteroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-channelsplitternode-channelsplitternode-context-options-options) = {});
};

#### 1.15.1. Constructors[](https://www.w3.org/TR/webaudio/#ChannelSplitterNode-constructors)

`ChannelSplitterNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-channelsplitternode-constructor-channelsplitternode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.15.2. `[ChannelSplitterOptions](https://www.w3.org/TR/webaudio/#dictdef-channelsplitteroptions)`[](https://www.w3.org/TR/webaudio/#ChannelSplitterOptions)

dictionary `ChannelSplitterOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-channelsplitteroptions-numberofoutputs) = 6;
};

##### 1.15.2.1. Dictionary `[ChannelSplitterOptions](https://www.w3.org/TR/webaudio/#dictdef-channelsplitteroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-channelsplitteroptions-members)

`numberOfOutputs`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `6`

The number outputs for the `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`. See `[createChannelSplitter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createchannelsplitter)` for constraints on this value.

### 1.16. The `[ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode)` Interface[](https://www.w3.org/TR/webaudio/#ConstantSourceNode)

[ConstantSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/ConstantSourceNode "The ConstantSourceNode interface—part of the Web Audio API—represents an audio source (based upon AudioScheduledSourceNode) whose output is single unchanging value. This makes it useful for cases in which you need a constant value coming in from an audio source. In addition, it can be used like a constructible AudioParam by automating the value of its offset or by connecting another node to it; see Controlling multiple parameters with ConstantSourceNode.")

Firefox52+SafariNoneChrome56+

---

Opera43+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android52+iOS SafariNoneChrome for Android56+Android WebView56+Samsung Internet6.0+Opera Mobile43+

This interface represents a constant audio source whose output is nominally a constant value. It is useful as a constant source node in general and can be used as if it were a constructible `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` by automating its `[offset](https://www.w3.org/TR/webaudio/#dom-constantsourcenode-offset)` or connecting another node to it.

The single output of this node consists of one channel (mono).

[ConstantSourceNode/ConstantSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/ConstantSourceNode/ConstantSourceNode "The ConstantSourceNode() constructor creates a new ConstantSourceNode object instance, representing an audio source which constantly outputs samples whose values are always the same.")

Firefox52+SafariNoneChrome56+

---

Opera43+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android52+iOS SafariNoneChrome for Android56+Android WebView56+Samsung Internet6.0+Opera Mobile43+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `ConstantSourceNode` : [AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-constantsourcenode-constantsourcenode-context-options-context), optional [ConstantSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-constantsourceoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-constantsourcenode-constantsourcenode-context-options-options) = {});
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [offset](https://www.w3.org/TR/webaudio/#dom-constantsourcenode-offset);
};

#### 1.16.1. Constructors[](https://www.w3.org/TR/webaudio/#ConstantSourceNode-constructors)

`ConstantSourceNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-constantsourcenode-constructor-constantsourcenode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.16.2. Attributes[](https://www.w3.org/TR/webaudio/#ConstantSourceNode-attributes)

[ConstantSourceNode/offset](https://developer.mozilla.org/en-US/docs/Web/API/ConstantSourceNode/offset "The read-only offset property of the ConstantSourceNode interface returns a AudioParam object indicating the numeric a-rate value which is always returned by the source when asked for the next sample.")

Firefox52+SafariNoneChrome56+

---

OperaNoneEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android52+iOS SafariNoneChrome for AndroidNoneAndroid WebViewNoneSamsung InternetNoneOpera MobileNone

`offset`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The constant value of the source.

#### 1.16.3. `[ConstantSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-constantsourceoptions)`[](https://www.w3.org/TR/webaudio/#ConstantSourceOptions)

This specifies options for constructing a `[ConstantSourceNode](https://www.w3.org/TR/webaudio/#constantsourcenode)`. All members are optional; if not specified, the normal defaults are used for constructing the node.

dictionary `ConstantSourceOptions` {
[float](https://heycam.github.io/webidl/#idl-float) [offset](https://www.w3.org/TR/webaudio/#dom-constantsourceoptions-offset) = 1;
};

##### 1.16.3.1. Dictionary `[ConstantSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-constantsourceoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-constantsourceoptions-members)

`offset`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `1`

The initial value for the `[offset](https://www.w3.org/TR/webaudio/#dom-constantsourcenode-offset)` AudioParam of this node.

### 1.17. The `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` Interface[](https://www.w3.org/TR/webaudio/#ConvolverNode)

[ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode "The ConvolverNode interface is an AudioNode that performs a Linear Convolution on a given AudioBuffer, often used to achieve a reverb effect. A ConvolverNode always has exactly one input and one output.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

This interface represents a processing node which applies a linear convolution effect given an impulse response.

The input of this node is either mono (1 channel) or stereo (2 channels) and cannot be increased. Connections from nodes with more channels will be [down-mixed appropriately](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing).

There are [channelCount constraints](https://www.w3.org/TR/webaudio/#audionode-channelcount-constraints) and [channelCountMode constraints](https://www.w3.org/TR/webaudio/#audionode-channelcountmode-constraints) for this node. These constraints ensure that the input to the node is either mono or stereo.

[ConvolverNode/ConvolverNode](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode/ConvolverNode "The ConvolverNode() constructor of the Web Audio API creates a new ConvolverNode object instance.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `ConvolverNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-convolvernode-convolvernode-context-options-context), optional [ConvolverOptions](https://www.w3.org/TR/webaudio/#dictdef-convolveroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-convolvernode-convolvernode-context-options-options) = {});
attribute [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)? [buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer);
attribute [boolean](https://heycam.github.io/webidl/#idl-boolean) [normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize);
};

#### 1.17.1. Constructors[](https://www.w3.org/TR/webaudio/#ConvolverNode-constructors)

`ConvolverNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-convolvernode-constructor-convolvernode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` context and an option object options, execute these steps:

1.  Set the attributes `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` to the inverse of the value of `[disableNormalization](https://www.w3.org/TR/webaudio/#dom-convolveroptions-disablenormalization)`.
2.  If `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` is [present](https://infra.spec.whatwg.org/#map-exists), set the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` attribute to its value.

    Note: This means that the buffer will be normalized according to the value of the `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` attribute.

3.  Let o be new `[AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions)` dictionary.
4.  If `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelcount)` is [present](https://infra.spec.whatwg.org/#map-exists) in options, set `[channelCount](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelcount)` on o with the same value.
5.  If `[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelcountmode)` is [present](https://infra.spec.whatwg.org/#map-exists) in options, set `[channelCountMode](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelcountmode)` on o with the same value.
6.  If `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelinterpretation)` is [present](https://infra.spec.whatwg.org/#map-exists) in options, set `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionodeoptions-channelinterpretation)` on o with the same value.
7.  [Initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with c and o as argument.

#### 1.17.2. Attributes[](https://www.w3.org/TR/webaudio/#ConvolverNode-attributes)

[ConvolverNode/buffer](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode/buffer "The buffer property of the ConvolverNode interface represents a mono, stereo, or 4-channel AudioBuffer containing the (possibly multichannel) impulse response used by the ConvolverNode to create the reverb effect.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`buffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), nullable

At the time when this attribute is set, the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` and the state of the `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` attribute will be used to configure the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` with this impulse response having the given normalization. The initial value of this attribute is null.

Note: If the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` is set to an new buffer, audio may glitch. If this is undesirable, it is recommended to create a new `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` to replace the old, possibly cross-fading between the two.

Note: The `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` produces a mono output only in the single case where there is a single input channel and a single-channel `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)`. In all other cases, the output is stereo. In particular, when the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` has four channels and there are two input channels, the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` performs matrix "true" stereo convolution. For normative information please see the [channel configuration diagrams](https://www.w3.org/TR/webaudio/#Convolution-channel-configurations)

[ConvolverNode/normalize](https://developer.mozilla.org/en-US/docs/Web/API/ConvolverNode/normalize "The normalize property of the ConvolverNode interface is a boolean that controls whether the impulse response from the buffer will be scaled by an equal-power normalization when the buffer attribute is set, or not.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`normalize`, of type [boolean](https://heycam.github.io/webidl/#idl-boolean)

Controls whether the impulse response from the buffer will be scaled by an equal-power normalization when the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` atttribute is set. Its default value is `true` in order to achieve a more uniform output level from the convolver when loaded with diverse impulse responses. If `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` is set to `false`, then the convolution will be rendered with no pre-processing/scaling of the impulse response. Changes to this value do not take effect until the next time the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` attribute is set.

If the `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` attribute is false when the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` attribute is set then the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` will perform a linear convolution given the exact impulse response contained within the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)`.

Otherwise, if the `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` attribute is true when the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` attribute is set then the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` will first perform a scaled RMS-power analysis of the audio data contained within `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` to calculate a normalizationScale given this algorithm:

function calculateNormalizationScale(buffer) { const GainCalibration \= 0.00125; const GainCalibrationSampleRate \= 44100; const MinPower \= 0.000125; // Normalize by RMS power. const numberOfChannels \= buffer.numberOfChannels; const length \= buffer.length; let power \= 0; for (let i \= 0; i < numberOfChannels; i++) { let channelPower \= 0; const channelData \= buffer.getChannelData(i); for (let j \= 0; j < length; j++) { const sample \= channelData\[j\]; channelPower += sample \* sample; } power += channelPower; } power \= Math.sqrt(power / (numberOfChannels \* length)); // Protect against accidental overload. if (!isFinite(power) || isNaN(power) || power < MinPower) power \= MinPower; let scale \= 1 / power; // Calibrate to make perceived volume same as unprocessed. scale \*= GainCalibration; // Scale depends on sample-rate. if (buffer.sampleRate) scale \*= GainCalibrationSampleRate / buffer.sampleRate; // True-stereo compensation. if (numberOfChannels \== 4) scale \*= 0.5; return scale;}

During processing, the ConvolverNode will then take this calculated normalizationScale value and multiply it by the result of the linear convolution resulting from processing the input with the impulse response (represented by the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)`) to produce the final output. Or any mathematically equivalent operation may be used, such as pre-multiplying the input by normalizationScale, or pre-multiplying a version of the impulse-response by normalizationScale.

#### 1.17.3. `[ConvolverOptions](https://www.w3.org/TR/webaudio/#dictdef-convolveroptions)`[](https://www.w3.org/TR/webaudio/#ConvolverOptions)

The specifies options for constructing a `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`. All members are optional; if not specified, the node is contructing using the normal defaults.

dictionary `ConvolverOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)? [buffer](https://www.w3.org/TR/webaudio/#dom-convolveroptions-buffer);
[boolean](https://heycam.github.io/webidl/#idl-boolean) [disableNormalization](https://www.w3.org/TR/webaudio/#dom-convolveroptions-disablenormalization) = false;
};

##### 1.17.3.1. Dictionary `[ConvolverOptions](https://www.w3.org/TR/webaudio/#dictdef-convolveroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-convolveroptions-members)

`buffer`, of type [AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer), nullable

The desired buffer for the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`. This buffer will be normalized according to the value of `[disableNormalization](https://www.w3.org/TR/webaudio/#dom-convolveroptions-disablenormalization)`.

`disableNormalization`, of type [boolean](https://heycam.github.io/webidl/#idl-boolean), defaulting to `false`

The opposite of the desired initial value for the `[normalize](https://www.w3.org/TR/webaudio/#dom-convolvernode-normalize)` attribute of the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`.

#### 1.17.4. Channel Configurations for Input, Impulse Response and Output[](https://www.w3.org/TR/webaudio/#Convolution-channel-configurations)

Implementations MUST support the following allowable configurations of impulse response channels in a `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` to achieve various reverb effects with 1 or 2 channels of input.

As shown in the diagram below, single channel convolution operates on a mono audio input, using a mono impulse response, and generating a mono output. The remaining images in the diagram illustrate the supported cases for mono and stereo playback where the number of channels of the input is 1 or 2, and the number of channels in the `[buffer](https://www.w3.org/TR/webaudio/#dom-convolvernode-buffer)` is 1, 2, or 4. Developers desiring more complex and arbitrary matrixing can use a `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`, multiple single-channel `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`s and a `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)`.

If this node is not [actively processing](https://www.w3.org/TR/webaudio/#actively-processing), the output is a single channel of silence.

Note: The diagrams below show the outputs when [actively processing](https://www.w3.org/TR/webaudio/#actively-processing).

![reverb matrixing](https://www.w3.org/TR/webaudio/images/convolver-diagram.png)

A graphical representation of supported input and output channel count possibilities when using a `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`.

### 1.18. The `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` Interface[](https://www.w3.org/TR/webaudio/#DelayNode)

[DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode "The DelayNode interface represents a delay-line; an AudioNode audio-processing module that causes a delay between the arrival of an input data and its propagation to the output.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

A delay-line is a fundamental building block in audio applications. This interface is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` with a single input and single output.

The number of channels of the output always equals the number of channels of the input.

It delays the incoming audio signal by a certain amount. Specifically, at each time _t_, input signal _input(t)_, delay time _delayTime(t)_ and output signal _output(t)_, the output will be _output(t) = input(t - delayTime(t))_. The default `delayTime` is 0 seconds (no delay).

When the number of channels in a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`'s input changes (thus changing the output channel count also), there may be delayed audio samples which have not yet been output by the node and are part of its internal state. If these samples were received earlier with a different channel count, they MUST be upmixed or downmixed before being combined with newly received input so that all internal delay-line mixing takes place using the single prevailing channel layout.

Note: By definition, a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` introduces an audio processing latency equal to the amount of the delay.

[DelayNode/DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode/DelayNode "The DelayNode() constructor of the Web Audio API creates a new DelayNode object with a delay-line; an AudioNode audio-processing module that causes a delay between the arrival of an input data, and its propagation to the output.The DelayNode() constructor of the Web Audio API creates a new DelayNode object with a delay-line; an AudioNode audio-processing module that causes a delay between the arrival of an input data, and its propagation to the output.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `DelayNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-delaynode-delaynode-context-options-context), optional [DelayOptions](https://www.w3.org/TR/webaudio/#dictdef-delayoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-delaynode-delaynode-context-options-options) = {});
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [delayTime](https://www.w3.org/TR/webaudio/#dom-delaynode-delaytime);
};

#### 1.18.1. Constructors[](https://www.w3.org/TR/webaudio/#DelayNode-constructors)

`DelayNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-delaynode-constructor-delaynode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.18.2. Attributes[](https://www.w3.org/TR/webaudio/#DelayNode-attributes)

[DelayNode/delayTime](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode/delayTime "The delayTime property of the DelayNode interface is an a-rate AudioParam representing the amount of delay to apply.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`delayTime`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

An `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` object representing the amount of delay (in seconds) to apply. Its default `value` is 0 (no delay). The minimum value is 0 and the maximum value is determined by the `[maxDelayTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdelay-maxdelaytime-maxdelaytime)` argument to the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` method `[createDelay()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdelay)` or the `[maxDelayTime](https://www.w3.org/TR/webaudio/#dom-delayoptions-maxdelaytime)` member of the `[DelayOptions](https://www.w3.org/TR/webaudio/#dictdef-delayoptions)` dictionary for the `[constructor](https://www.w3.org/TR/webaudio/#dom-delaynode-delaynode)`.

If `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` is part of a [cycle](https://www.w3.org/TR/webaudio/#cycle), then the value of the `[delayTime](https://www.w3.org/TR/webaudio/#dom-delaynode-delaytime)` attribute is clamped to a minimum of one [render quantum](https://www.w3.org/TR/webaudio/#render-quantum).

#### 1.18.3. `[DelayOptions](https://www.w3.org/TR/webaudio/#dictdef-delayoptions)`[](https://www.w3.org/TR/webaudio/#DelayOptions)

This specifies options for constructing a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`. All members are optional; if not given, the node is constructed using the normal defaults.

dictionary `DelayOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[double](https://heycam.github.io/webidl/#idl-double) [maxDelayTime](https://www.w3.org/TR/webaudio/#dom-delayoptions-maxdelaytime) = 1;
[double](https://heycam.github.io/webidl/#idl-double) [delayTime](https://www.w3.org/TR/webaudio/#dom-delayoptions-delaytime) = 0;
};

##### 1.18.3.1. Dictionary `[DelayOptions](https://www.w3.org/TR/webaudio/#dictdef-delayoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-delayoptions-members)

`delayTime`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `0`

The initial delay time for the node.

`maxDelayTime`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `1`

The maximum delay time for the node. See `[createDelay(maxDelayTime)](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createdelay-maxdelaytime-maxdelaytime)` for constraints.

#### 1.18.4. Processing[](https://www.w3.org/TR/webaudio/#DelayNode-processing)

A `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` has an internal buffer that holds `[delayTime](https://www.w3.org/TR/webaudio/#delaynode)` seconds of audio.

The processing of a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` is broken down in two parts: writing to the delay line, and reading from the delay line. This is done via two internal `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s (that are not available to authors and exist only to ease the description of the inner workings of the node). Both are created from a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`.

Creating a DelayWriter for a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` means creating an object that has the same interface as an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, and that writes the input audio into the internal buffer of the `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`. It has the same input connections as the `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` it was created from.

Creating a DelayReader for a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` means creating an object that has the same interface as an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, and that can read the audio data from the internal buffer of the `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`. It is connected to the same `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s as the `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` it was created from. A [DelayReader](https://www.w3.org/TR/webaudio/#delayreader) is a [source node](https://www.w3.org/TR/webaudio/#source-node).

When processing an input buffer, a [DelayWriter](https://www.w3.org/TR/webaudio/#delaywriter) MUST write the audio to the internal buffer of the `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`.

When producing an output buffer, a [DelayReader](https://www.w3.org/TR/webaudio/#delayreader) MUST yield exactly the audio that was written to the corresponding [DelayWriter](https://www.w3.org/TR/webaudio/#delaywriter) `[delayTime](https://www.w3.org/TR/webaudio/#delaynode)` seconds ago.

Note: This means that channel count changes are reflected after the delay time has passed.

### 1.19. The `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` Interface[](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode)

`[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` processor implementing a dynamics compression effect.

Dynamics compression is very commonly used in musical production and game audio. It lowers the volume of the loudest parts of the signal and raises the volume of the softest parts. Overall, a louder, richer, and fuller sound can be achieved. It is especially important in games and musical applications where large numbers of individual sounds are played simultaneous to control the overall signal level and help avoid clipping (distorting) the audio output to the speakers.

[DynamicsCompressorNode/DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode "The DynamicsCompressorNode() constructor creates a new DynamicsCompressorNode object which provides a compression effect, which lowers the volume of the loudest parts of the signal")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode "The DynamicsCompressorNode interface provides a compression effect, which lowers the volume of the loudest parts of the signal in order to help prevent clipping and distortion that can occur when multiple sounds are played and multiplexed together at once. This is often used in musical production and game audio. DynamicsCompressorNode is an AudioNode that has exactly one input and one output; it is created using the BaseAudioContext.createDynamicsCompressor method.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `DynamicsCompressorNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-dynamicscompressornode-context-options-context),
optional [DynamicsCompressorOptions](https://www.w3.org/TR/webaudio/#dictdef-dynamicscompressoroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-dynamicscompressornode-context-options-options) = {});
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [threshold](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-threshold);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [knee](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-knee);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [ratio](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-ratio);
readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [reduction](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-reduction);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [attack](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-attack);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [release](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-release);
};

#### 1.19.1. Constructors[](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode-constructors)

`DynamicsCompressorNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-constructor-dynamicscompressornode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

Let `[[internal reduction]]` be a private slot on this, that holds a floating point number, in decibels. Set `[[[internal reduction]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-internal-reduction-slot)` to 0.0.

#### 1.19.2. Attributes[](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode-attributes)

[DynamicsCompressorNode/attack](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/attack "The attack property of the DynamicsCompressorNode interface is a k-rate AudioParam representing the amount of time, in seconds, required to reduce the gain by 10 dB. It defines how quickly the signal is adapted when its volume is increased.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`attack`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The amount of time (in seconds) to reduce the gain by 10dB.

[DynamicsCompressorNode/knee](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/knee "The knee property of the DynamicsCompressorNode interface is a k-rate AudioParam containing a decibel value representing the range above the threshold where the curve smoothly transitions to the compressed portion.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`knee`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

A decibel value representing the range above the threshold where the curve smoothly transitions to the "ratio" portion.

[DynamicsCompressorNode/ratio](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/ratio "The ratio property of the DynamicsCompressorNode interface Is a k-rate AudioParam representing the amount of change, in dB, needed in the input for a 1 dB change in the output.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`ratio`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The amount of dB change in input for a 1 dB change in output.

[DynamicsCompressorNode/reduction](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/reduction "The reduction read-only property of the DynamicsCompressorNode interface is a float representing the amount of gain reduction currently applied by the compressor to the signal.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`reduction`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

A read-only decibel value for metering purposes, representing the current amount of gain reduction that the compressor is applying to the signal. If fed no signal the value will be 0 (no gain reduction). When this attribute is read, return the value of the private slot `[[[internal reduction]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-internal-reduction-slot)`.

[DynamicsCompressorNode/release](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/release "The release property of the DynamicsCompressorNode interface Is a k-rate AudioParam representing the amount of time, in seconds, required to increase the gain by 10 dB. It defines how quick the signal is adapted when its volume is reduced.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`release`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The amount of time (in seconds) to increase the gain by 10dB.

[DynamicsCompressorNode/threshold](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/threshold "The threshold property of the DynamicsCompressorNode interface is a k-rate AudioParam representing the decibel value above which the compression will start taking effect.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`threshold`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The decibel value above which the compression will start taking effect.

#### 1.19.3. `[DynamicsCompressorOptions](https://www.w3.org/TR/webaudio/#dictdef-dynamicscompressoroptions)`[](https://www.w3.org/TR/webaudio/#DynamicsCompressorOptions)

This specifies the options to use in constructing a `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`. All members are optional; if not specified the normal defaults are used in constructing the node.

dictionary `DynamicsCompressorOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[float](https://heycam.github.io/webidl/#idl-float) [attack](https://www.w3.org/TR/webaudio/#dom-dynamicscompressoroptions-attack) = 0.003;
[float](https://heycam.github.io/webidl/#idl-float) [knee](https://www.w3.org/TR/webaudio/#dom-dynamicscompressoroptions-knee) = 30;
[float](https://heycam.github.io/webidl/#idl-float) [ratio](https://www.w3.org/TR/webaudio/#dom-dynamicscompressoroptions-ratio) = 12;
[float](https://heycam.github.io/webidl/#idl-float) [release](https://www.w3.org/TR/webaudio/#dom-dynamicscompressoroptions-release) = 0.25;
[float](https://heycam.github.io/webidl/#idl-float) [threshold](https://www.w3.org/TR/webaudio/#dom-dynamicscompressoroptions-threshold) = -24;
};

##### 1.19.3.1. Dictionary `[DynamicsCompressorOptions](https://www.w3.org/TR/webaudio/#dictdef-dynamicscompressoroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-dynamicscompressoroptions-members)

`attack`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0.003`

The initial value for the `[attack](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-attack)` AudioParam.

`knee`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `30`

The initial value for the `[knee](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-knee)` AudioParam.

`ratio`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `12`

The initial value for the `[ratio](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-ratio)` AudioParam.

`release`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0.25`

The initial value for the `[release](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-release)` AudioParam.

`threshold`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `-24`

The initial value for the `[threshold](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-threshold)` AudioParam.

#### 1.19.4. Processing[](https://www.w3.org/TR/webaudio/#DynamicsCompressorOptions-processing)

Dynamics compression can be implemented in a variety of ways. The `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` implements a dynamics processor that has the following characteristics:

- Fixed look-ahead (this means that an `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` adds a fixed latency to the signal chain).
- Configurable attack speed, release speed, threshold, knee hardness and ratio.
- Side-chaining is not supported.
- The gain reduction is reported _via_ the `reduction` property on the `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`.
- The compression curve has three parts:

  - The first part is the identity: f(x)\=x.
  - The second part is the soft-knee portion, which MUST be a monotonically increasing function.
  - The third part is a linear function: f(x)\=1ratio⋅x.

  This curve MUST be continuous and piece-wise differentiable, and corresponds to a target output level, based on the input level.

Graphically, such a curve would look something like this:

![Graphical representation of a compression curve](https://www.w3.org/TR/webaudio/images/compression-curve.svg)

A typical compression curve, showing the knee portion (soft or hard) as well as the threshold.

Internally, the `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` is described with a combination of other `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s, as well as a special algorithm, to compute the gain reduction value.

The following `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` graph is used internally, `input` and `output` respectively being the input and output `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, `context` the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` for this `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`, and a new class, EnvelopeFollower, that instantiates a special object that behaves like an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, described below:

const delay = new DelayNode(context, {delayTime: 0.006});
const gain = new GainNode(context);
const compression = new EnvelopeFollower();

input.connect(delay).connect(gain).connect(output);
input.connect(compression).connect(gain.gain);

![Schema of
the internal graph used by the DynamicCompressorNode](https://www.w3.org/TR/webaudio/images/dynamicscompressor-internal-graph.svg)

The graph of internal `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s used as part of the `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` processing algorithm.

Note: This implements the pre-delay and the application of the reduction gain.

The following algorithm describes the processing performed by an [EnvelopeFollower](https://www.w3.org/TR/webaudio/#envelopefollower) object, to be applied to the input signal to produce the gain reduction value. An [EnvelopeFollower](https://www.w3.org/TR/webaudio/#envelopefollower) has two slots holding floating point values. Those values persist accros invocation of this algorithm.

- Let `[[detector average]]` be a floating point number, initialized to 0.0.
- Let `[[compressor gain]]` be a floating point number, initialized to 1.0.

The following algorithm allow determining a value for reduction gain, for each sample of input, for a render quantum of audio.

1.  Let attack and release have the values of `[attack](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-attack)` and `[release](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-release)`, respectively, sampled at the time of processing (those are [k-rate](https://www.w3.org/TR/webaudio/#k-rate) parameters), mutiplied by the sample-rate of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` this `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` is [associated](https://www.w3.org/TR/webaudio/#associated) with.
2.  Let detector average be the value of the slot `[[[detector average]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-detector-average-slot)`.
3.  Let compressor gain be the value of the slot `[[[compressor gain]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-compressor-gain-slot)`.
4.  For each sample input of the render quantum to be processed, execute the following steps:

    1.  If the absolute value of input is less than 0.0001, let attenuation be 1.0. Else, let shaped input be the value of applying the [compression curve](https://www.w3.org/TR/webaudio/#compression-curve) to the absolute value of input. Let attenuation be shaped input divided by the absolute value of input.
    2.  Let releasing be `true` if attenuation is greater than compressor gain, `false` otherwise.
    3.  Let detector rate be the result of applying the [detector curve](https://www.w3.org/TR/webaudio/#detector-curve) to attenuation.
    4.  Subtract detector average from attenuation, and multiply the result by detector rate. Add this new result to detector average.
    5.  Clamp detector average to a maximum of 1.0.
    6.  Let envelope rate be the result of [computing the envelope rate](https://www.w3.org/TR/webaudio/#computing-the-envelope-rate) based on values of attack and release.
    7.  If releasing is `true`, set compressor gain to be the product of compressor gain and envelope rate, clamped to a maximum of 1.0.
    8.  Else, if releasing is `false`, let gain increment to be detector average minus compressor gain. Multiply gain increment by envelope rate, and add the result to compressor gain.
    9.  Compute reduction gain to be compressor gain multiplied by the return value of [computing the makeup gain](https://www.w3.org/TR/webaudio/#computing-the-makeup-gain).
    10. Compute metering gain to be reduction gain, [converted to decibel](https://www.w3.org/TR/webaudio/#linear-to-decibel).

5.  Set `[[[compressor gain]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-compressor-gain-slot)` to compressor gain.
6.  Set `[[[detector average]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-detector-average-slot)` to detector average.
7.  [Atomically](https://www.w3.org/TR/webaudio/#atomically) set the internal slot `[[[internal reduction]]](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-internal-reduction-slot)` to the value of metering gain.

    Note: This step makes the metering gain update once per block, at the end of the block processing.

The makeup gain is a fixed gain stage that only depends on ratio, knee and threshold parameter of the compressor, and not on the input signal. The intent here is to increase the output level of the compressor so it is comparable to the input level.

Computing the makeup gain means executing the following steps:

1.  Let full range gain be the value returned by applying the [compression curve](https://www.w3.org/TR/webaudio/#compression-curve) to the value 1.0.
2.  Let full range makeup gain be the inverse of full range gain.
3.  Return the result of taking the 0.6 power of full range makeup gain.

Computing the envelope rate is done by applying a function to the ratio of the compressor gain and the detector average. User-agents are allowed to choose the shape of the envelope function. However, this function MUST respect the following constraints:

- The envelope rate MUST be the calculated from the ratio of the compressor gain and the detector average.

  Note: When attacking, this number less than or equal to 1, when releasing, this number is strictly greater than 1.

- The attack curve MUST be a continuous, monotonically increasing function in the range \[0,1\]. The shape of this curve MAY be controlled by `[attack](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-attack)`.
- The release curve MUST be a continuous, monotonically decreasing function that is always greater than 1. The shape of this curve MAY be controlled by `[release](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-release)`.

This operation returns the value computed by applying this function to the ratio of compressor gain and detector average.

Applying the detector curve to the change rate when attacking or releasing allow implementing _adaptive release_. It is a function that MUST respect the following constraints:

- The output of the function MUST be in \[0,1\].
- The function MUST be monotonically increasing, continuous.

Note: It is allowed, for example, to have a compressor that performs an _adaptive release_, that is, releasing faster the harder the compression, or to have curves for attack and release that are not of the same shape.

Applying a compression curve to a value means computing the value of this sample when passed to a function, and returning the computed value. This function MUST respect the following characteristics:

1.  Let threshold and knee have the values of `[threshold](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-threshold)` and `[knee](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-knee)`, respectively, [converted to linear units](https://www.w3.org/TR/webaudio/#decibels-to-linear-gain-unit) and sampled at the time of processing of this block (as [k-rate](https://www.w3.org/TR/webaudio/#k-rate) parameters).
2.  Calculate the sum of `[threshold](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-threshold)` plus `[knee](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-knee)` also sampled at the time of processing of this block (as [k-rate](https://www.w3.org/TR/webaudio/#k-rate) parameters).
3.  Let knee end threshold have the value of this sum [converted to linear units](https://www.w3.org/TR/webaudio/#decibels-to-linear-gain-unit).
4.  Let ratio have the value of the `[ratio](https://www.w3.org/TR/webaudio/#dom-dynamicscompressornode-ratio)`, sampled at the time of processing of this block (as a [k-rate](https://www.w3.org/TR/webaudio/#k-rate) parameter).
5.  This function is the identity up to the value of the linear threshold (i.e., f(x)\=x).
6.  From the threshold up to the knee end threshold, User-Agents can choose the curve shape. The whole function MUST be monotonically increasing and continuous.

    Note: If the knee is 0, the `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` is called a hard-knee compressor.

7.  This function is linear, based on the ratio, after the threshold and the soft knee (i.e., f(x)\=1ratio⋅x).

Converting a value v in linear gain unit to decibel means executing the following steps:

1.  If v is equal to zero, return -1000.
2.  Else, return 20log10⁡v.

Converting a value v in decibels to linear gain unit means returning 10v/20.

### 1.20. The `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)` Interface[](https://www.w3.org/TR/webaudio/#GainNode)

Changing the gain of an audio signal is a fundamental operation in audio applications. This interface is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` with a single input and single output:

Each sample of each channel of the input data of the `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)` MUST be multiplied by the [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) of the `[gain](https://www.w3.org/TR/webaudio/#dom-gainnode-gain)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`.

[GainNode/GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode/GainNode "The GainNode() constructor of the Web Audio API creates a new GainNode object which an AudioNode that represents a change in volume.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode "The GainNode interface represents a change in volume. It is an AudioNode audio-processing module that causes a given gain to be applied to the input data before its propagation to the output. A GainNode always has exactly one input and one output, both with the same number of channels.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `GainNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-gainnode-gainnode-context-options-context), optional [GainOptions](https://www.w3.org/TR/webaudio/#dictdef-gainoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-gainnode-gainnode-context-options-options) = {});
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [gain](https://www.w3.org/TR/webaudio/#dom-gainnode-gain);
};

#### 1.20.1. Constructors[](https://www.w3.org/TR/webaudio/#GainNode-constructors)

`GainNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-gainnode-constructor-gainnode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.20.2. Attributes[](https://www.w3.org/TR/webaudio/#GainNode-attributes)

[GainNode/gain](https://developer.mozilla.org/en-US/docs/Web/API/GainNode/gain "The gain property of the GainNode interface is an a-rate AudioParam representing the amount of gain to apply.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`gain`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Represents the amount of gain to apply.

#### 1.20.3. `[GainOptions](https://www.w3.org/TR/webaudio/#dictdef-gainoptions)`[](https://www.w3.org/TR/webaudio/#GainOptions)

This specifies options to use in constructing a `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)`. All members are optional; if not specified, the normal defaults are used in constructing the node.

dictionary `GainOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[float](https://heycam.github.io/webidl/#idl-float) [gain](https://www.w3.org/TR/webaudio/#dom-gainoptions-gain) = 1.0;
};

##### 1.20.3.1. Dictionary `[GainOptions](https://www.w3.org/TR/webaudio/#dictdef-gainoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-gainoptions-members)

`gain`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `1.0`

The initial gain value for the `[gain](https://www.w3.org/TR/webaudio/#dom-gainnode-gain)` AudioParam.

### 1.21. The `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)` Interface[](https://www.w3.org/TR/webaudio/#IIRFilterNode)

`[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)` is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` processor implementing a general [IIR Filter](https://en.wikipedia.org/wiki/Infinite_impulse_response). In general, it is best to use `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)`'s to implement higher-order filters for the following reasons:

- Generally less sensitive to numeric issues
- Filter parameters can be automated
- Can be used to create all even-ordered IIR filters

However, odd-ordered filters cannot be created, so if such filters are needed or automation is not needed, then IIR filters may be appropriate.

Once created, the coefficients of the IIR filter cannot be changed.

The number of channels of the output always equals the number of channels of the input.

[IIRFilterNode/IIRFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/IIRFilterNode/IIRFilterNode "The IIRFilterNode() constructor of the Web Audio API creates a new IIRFilterNode object which an AudioNode processor which implements a general infinite impulse response filter.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[IIRFilterNode](https://developer.mozilla.org/en-US/docs/Web/API/IIRFilterNode "The IIRFilterNode interface of the Web Audio API is a AudioNode processor which implements a general infinite impulse response (IIR) filter; this type of filter can be used to implement tone control devices and graphic equalizers as well. It lets the parameters of the filter response be specified, so that it can be tuned as needed.")

Firefox50+SafariNoneChrome49+

---

Opera36+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for Android50+iOS SafariNoneChrome for Android49+Android WebView49+Samsung Internet5.0+Opera Mobile36+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `IIRFilterNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
`constructor` ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-iirfilternode-context-options-context), [IIRFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-iirfilteroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-iirfilternode-context-options-options));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [getFrequencyResponse](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse) ([Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `frequencyHz`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse-frequencyhz-magresponse-phaseresponse-frequencyhz),
[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `magResponse`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse-frequencyhz-magresponse-phaseresponse-magresponse),
[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array) `phaseResponse`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse-frequencyhz-magresponse-phaseresponse-phaseresponse));
};

#### 1.21.1. Constructors[](https://www.w3.org/TR/webaudio/#IIRFilterNode-constructors)

`IIRFilterNode(context, options)`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-constructor-iirfilternode)

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.21.2. Methods[](https://www.w3.org/TR/webaudio/#IIRFilterNode-methods)

[IIRFilterNode/getFrequencyResponse](https://developer.mozilla.org/en-US/docs/Web/API/IIRFilterNode/getFrequencyResponse "The getFrequencyResponse() method of the IIRFilterNode interface takes the current filtering algorithm's settings and calculates the frequency response for frequencies specified in a specified array of frequencies.")

Firefox50+SafariNoneChrome49+

---

Opera36+Edge79+

---

Edge (Legacy)14+IENone

---

Firefox for Android50+iOS SafariNoneChrome for Android49+Android WebView49+Samsung Internet5.0+Opera Mobile36+

`getFrequencyResponse(frequencyHz, magResponse, phaseResponse)`

Given the current filter parameter settings, synchronously calculates the frequency response for the specified frequencies. The three parameters MUST be `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`s of the same length, or an `[InvalidAccessError](https://heycam.github.io/webidl/#invalidaccesserror)` MUST be thrown.

Arguments for the [IIRFilterNode.getFrequencyResponse()](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse) method.

Parameter

Type

Nullable

Optional

Description

`frequencyHz`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse-frequencyhz)

Float32Array

✘

✘

This parameter specifies an array of frequencies, in Hz, at which the response values will be calculated.

`magResponse`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse-magresponse)

Float32Array

✘

✘

This parameter specifies an output array receiving the linear magnitude response values. If a value in the `frequencyHz` parameter is not within \[0, sampleRate/2\], where `sampleRate` is the value of the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` property of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, the corresponding value at the same index of the `magResponse` array MUST be `NaN`.

`phaseResponse`[](https://www.w3.org/TR/webaudio/#dom-iirfilternode-getfrequencyresponse-phaseresponse)

Float32Array

✘

✘

This parameter specifies an output array receiving the phase response values in radians. If a value in the `frequencyHz` parameter is not within \[0; sampleRate/2\], where `sampleRate` is the value of the `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)` property of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, the corresponding value at the same index of the `phaseResponse` array MUST be `NaN`.

#### 1.21.3. `[IIRFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-iirfilteroptions)`[](https://www.w3.org/TR/webaudio/#IIRFilterOptions)

The `IIRFilterOptions` dictionary is used to specify the filter coefficients of the `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)`.

dictionary `IIRFilterOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
required [sequence](https://heycam.github.io/webidl/#idl-sequence)<[double](https://heycam.github.io/webidl/#idl-double)\> [feedforward](https://www.w3.org/TR/webaudio/#dom-iirfilteroptions-feedforward);
required [sequence](https://heycam.github.io/webidl/#idl-sequence)<[double](https://heycam.github.io/webidl/#idl-double)\> [feedback](https://www.w3.org/TR/webaudio/#dom-iirfilteroptions-feedback);
};

##### 1.21.3.1. Dictionary `[IIRFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-iirfilteroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-iirfilteroptions-members)

`feedforward`, of type sequence<[double](https://heycam.github.io/webidl/#idl-double)\>

The feedforward coefficients for the `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)`. This member is required. See `[feedforward](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter-feedforward)` argument of `[createIIRFilter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter)` for other constraints.

`feedback`, of type sequence<[double](https://heycam.github.io/webidl/#idl-double)\>

The feedback coefficients for the `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)`. This member is required. See `[feedback](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter-feedback)` argument of `[createIIRFilter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter)` for other constraints.

#### 1.21.4. Filter Definition[](https://www.w3.org/TR/webaudio/#IIRFilterNode-filter-definition)

Let bm be the `feedforward` coefficients and an be the `feedback` coefficients specified by `[createIIRFilter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter)` or the `[IIRFilterOptions](https://www.w3.org/TR/webaudio/#dictdef-iirfilteroptions)` dictionary for the `[constructor](https://www.w3.org/TR/webaudio/#dom-iirfilternode-iirfilternode)`. Then the transfer function of the general IIR filter is given by

H(z)\=∑m\=0Mbmz−m∑n\=0Nanz−n

where M+1 is the length of the b array and N+1 is the length of the a array. The coefficient a0 MUST not be 0 (see `[feedback parameter](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter-feedback)` for `[createIIRFilter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter)`). At least one of bm MUST be non-zero (see `[feedforward parameter](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter-feedforward)` for `[createIIRFilter()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createiirfilter)`).

Equivalently, the time-domain equation is:

∑k\=0Naky(n−k)\=∑k\=0Mbkx(n−k)

The initial filter state is the all-zeroes state.

Note: The UA may produce a warning to notify the user that NaN values have occurred in the filter state. This is usually indicative of an unstable filter.

### 1.22. The `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` Interface[](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode)

This interface represents an audio source from an `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` or `[video](https://html.spec.whatwg.org/multipage/media.html#video)` element.

The number of channels of the output corresponds to the number of channels of the media referenced by the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)`. Thus, changes to the media element’s `src` attribute can change the number of channels output by this node.

If the sample rate of the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` differs from the sample rate of the associated `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, then the output from the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` must be resampled to match the context’s `[sample rate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)`.

A `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` is created given an `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` using the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` `[createMediaElementSource()](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediaelementsource)` method or the `[mediaElement](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourceoptions-mediaelement)` member of the `[MediaElementAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediaelementaudiosourceoptions)` dictionary for the `[constructor](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourcenode-mediaelementaudiosourcenode)`.

The number of channels of the single output equals the number of channels of the audio referenced by the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` passed in as the argument to `[createMediaElementSource()](https://www.w3.org/TR/webaudio/#dom-audiocontext-createmediaelementsource)`, or is 1 if the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` has no audio.

The `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` MUST behave in an identical fashion after the `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` has been created, _except_ that the rendered audio will no longer be heard directly, but instead will be heard as a consequence of the `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` being connected through the routing graph. Thus pausing, seeking, volume, `src` attribute changes, and other aspects of the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` MUST behave as they normally would if _not_ used with a `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`.

[](https://www.w3.org/TR/webaudio/#example-92c31c2c)const mediaElement \= document.getElementById('mediaElementID');
const sourceNode \= context.createMediaElementSource(mediaElement);
sourceNode.connect(filterNode);

[MediaElementAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode "The MediaElementAudioSourceNode interface represents an audio source consisting of an HTML5 <audio> or <video> element. It is an AudioNode that acts as an audio source.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `MediaElementAudioSourceNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourcenode-mediaelementaudiosourcenode) ([AudioContext](https://www.w3.org/TR/webaudio/#audiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourcenode-mediaelementaudiosourcenode-context-options-context), [MediaElementAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediaelementaudiosourceoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourcenode-mediaelementaudiosourcenode-context-options-options));
\[[SameObject](https://heycam.github.io/webidl/#SameObject)\] readonly attribute [HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement) [mediaElement](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourcenode-mediaelement);
};

#### 1.22.1. Constructors[](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode-constructors)

`MediaElementAudioSourceNode(context, options)`

1.  [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.22.2. Attributes[](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode-attributes)

[MediaElementAudioSourceNode/mediaElement](https://developer.mozilla.org/en-US/docs/Web/API/MediaElementAudioSourceNode/mediaElement "The MediaElementAudioSourceNode interface's read-only mediaElement property indicates the HTMLMediaElement that contains the audio track from which the node is receiving audio.")

In all current engines.

Firefox70+Safari6+ChromeYes

---

OperaYesEdgeYes

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS Safari6+Chrome for AndroidYesAndroid WebViewYesSamsung InternetYesOpera MobileYes

`mediaElement`, of type [HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement), readonly

The `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` used when constructing this `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`.

#### 1.22.3. `[MediaElementAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediaelementaudiosourceoptions)`[](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceOptions)

This specifies the options to use in constructing a `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`.

dictionary `MediaElementAudioSourceOptions` {
required [HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement) [mediaElement](https://www.w3.org/TR/webaudio/#dom-mediaelementaudiosourceoptions-mediaelement);
};

##### 1.22.3.1. Dictionary `[MediaElementAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediaelementaudiosourceoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-mediaelementaudiosourceoptions-members)

`mediaElement`, of type [HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)

The media element that will be re-routed. This MUST be specified.

#### 1.22.4. Security with MediaElementAudioSourceNode and Cross-Origin Resources[](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceOptions-security)

`[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` allows the playback of cross-origin resources. Because Web Audio allows inspection of the content of the resource (e.g. using a `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)`, and an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` or `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` to read the samples), information leakage can occur if scripts from one [origin](https://html.spec.whatwg.org/multipage/origin.html#origin) inspect the content of a resource from another [origin](https://html.spec.whatwg.org/multipage/origin.html#origin).

To prevent this, a `[MediaElementAudioSourceNode](https://www.w3.org/TR/webaudio/#mediaelementaudiosourcenode)` MUST output _silence_ instead of the normal output of the `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` if it has been created using an `[HTMLMediaElement](https://html.spec.whatwg.org/multipage/media.html#htmlmediaelement)` for which the execution of the [fetch algorithm](https://fetch.spec.whatwg.org/#fetching) [\[FETCH\]](https://www.w3.org/TR/webaudio/#biblio-fetch) labeled the resource as [CORS-cross-origin](https://html.spec.whatwg.org/#cors-cross-origin).

### 1.23. The `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)` Interface[](https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode)

This interface is an audio destination representing a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` with a single `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` whose `kind` is `"audio"`. This `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` is created when the node is created and is accessible via the `[stream](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiodestinationnode-stream)` attribute. This stream can be used in a similar way as a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` obtained via `[getUserMedia()](https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia)`, and can, for example, be sent to a remote peer using the `RTCPeerConnection` (described in [\[webrtc\]](https://www.w3.org/TR/webaudio/#biblio-webrtc)) `addStream()` method.

The number of channels of the input is by default 2 (stereo).

[MediaStreamAudioDestinationNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode "The MediaStreamAudioDestinationNode interface represents an audio destination consisting of a WebRTC MediaStream with a single AudioMediaStreamTrack, which can be used in a similar way to a MediaStream obtained from Navigator.getUserMedia().")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `MediaStreamAudioDestinationNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiodestinationnode-mediastreamaudiodestinationnode) ([AudioContext](https://www.w3.org/TR/webaudio/#audiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiodestinationnode-mediastreamaudiodestinationnode-context-options-context), optional [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiodestinationnode-mediastreamaudiodestinationnode-context-options-options) = {});
readonly attribute [MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream) [stream](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiodestinationnode-stream);
};

#### 1.23.1. Constructors[](https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode-constructors)

`MediaStreamAudioDestinationNode(context, options)`

1.  [Initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.23.2. Attributes[](https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode-attributes)

[MediaStreamAudioDestinationNode/stream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode/stream "The stream property of the AudioContext interface represents a MediaStream containing a single audio MediaStreamTrack with the same number of channels as the node itself.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`stream`, of type [MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream), readonly

A `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` containing a single `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` with the same number of channels as the node itself, and whose `kind` attribute has the value `"audio"`.

### 1.24. The `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` Interface[](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode)

This interface represents an audio source from a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)`.

The number of channels of the output corresponds to the number of channels of the `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)`. When the `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` ends, this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` outputs one channel of silence.

If the sample rate of the `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` differs from the sample rate of the associated `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, then the output of the `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` is resampled to match the context’s `[sample rate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)`.

[MediaStreamAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceNode "The MediaStreamAudioSourceNode interface is a type of AudioNode which operates as an audio source whose media is received from a MediaStream obtained using the WebRTC or Media Capture and Streams APIs.")

In all current engines.

Firefox25+Safari11+Chrome23+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari11+Chrome for AndroidYesAndroid WebView37+Samsung InternetYesOpera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `MediaStreamAudioSourceNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourcenode-mediastreamaudiosourcenode) ([AudioContext](https://www.w3.org/TR/webaudio/#audiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourcenode-mediastreamaudiosourcenode-context-options-context), [MediaStreamAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediastreamaudiosourceoptions) `options`);
\[[SameObject](https://heycam.github.io/webidl/#SameObject)\] readonly attribute [MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream) [mediaStream](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourcenode-mediastream);
};

#### 1.24.1. Constructors[](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode-constructors)

`MediaStreamAudioSourceNode(context, options)`

1.  If the `[mediaStream](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourceoptions-mediastream)` member of `[options](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourcenode-mediastreamaudiosourcenode-context-options-options)` does not reference a `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` that has at least one `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` whose `kind` attribute has the value `"audio"`, throw an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` and abort these steps. Else, let this stream be inputStream.
2.  Let tracks be the list of all `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)`s of inputStream that have a `kind` of `"audio"`.
3.  Sort the elements in tracks based on their `id` attribute using an ordering on sequences of [code unit](https://infra.spec.whatwg.org/#code-unit) values.
4.  [Initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.
5.  Set an internal slot `[[input track]]` on this `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` to be the first element of tracks. This is the track used as the input audio for this `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)`.

After construction, any change to the `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` that was passed to the constructor do not affect the underlying output of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.

The slot `[[[input track]]](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourcenode-input-track-slot)` is only used to keep a reference to the `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)`.

Note: This means that when removing the track chosen by the constructor of the `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` from the `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` passed into this constructor, the `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)` will still take its input from the same track.

Note: The behaviour for picking the track to output is arbitrary for legacy reasons. `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` can be used instead to be explicit about which track to use as input.

#### 1.24.2. Attributes[](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode-attributes)

[MediaStreamAudioSourceNode/mediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceNode/mediaStream "The MediaStreamAudioSourceNode interface's read-only mediaStream property indicates the MediaStream that contains the audio track from which the node is receiving audio.")

In all current engines.

Firefox70+Safari11+Chrome23+

---

OperaYesEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS Safari11+Chrome for AndroidYesAndroid WebView37+Samsung InternetYesOpera MobileYes

`mediaStream`, of type [MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream), readonly

The `[MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)` used when constructing this `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)`.

#### 1.24.3. `[MediaStreamAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediastreamaudiosourceoptions)`[](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceOptions)

This specifies the options for constructing a `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)`.

[MediaStreamAudioSourceOptions](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceOptions "The MediaStreamAudioSourceOptions dictionary provides configuration options used when creating a MediaStreamAudioSourceNode using its constructor.")

In all current engines.

Firefox53+Safari6+Chrome55+

---

Opera15+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for Android53+iOS Safari?Chrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile14+

dictionary `MediaStreamAudioSourceOptions` {
required [MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream) [mediaStream](https://www.w3.org/TR/webaudio/#dom-mediastreamaudiosourceoptions-mediastream);
};

##### 1.24.3.1. Dictionary `[MediaStreamAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediastreamaudiosourceoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-mediastreamaudiosourceoptions-members)

[MediaStreamAudioSourceOptions/mediaStream](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceOptions/mediaStream "The MediaStreamAudioSourceOptions dictionary's mediaStream property must specify the MediaStream from which to retrieve audio data when instantiating a MediaStreamAudioSourceNode using the MediaStreamAudioSourceNode() constructor.")

Firefox53+Safari?Chrome55+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS Safari?Chrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile?

`mediaStream`, of type [MediaStream](https://www.w3.org/TR/mediacapture-streams/#dom-mediastream)

The media stream that will act as a source. This MUST be specified.

### 1.25. The `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` Interface[](https://www.w3.org/TR/webaudio/#MediaStreamTrackAudioSourceNode)

This interface represents an audio source from a `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)`.

The number of channels of the output corresponds to the number of channels of the `[mediaStreamTrack](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourceoptions-mediastreamtrack)`.

If the sample rate of the `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` differs from the sample rate of the associated `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, then the output of the `[mediaStreamTrack](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourceoptions-mediastreamtrack)` is resampled to match the context’s `[sample rate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)`.

[MediaStreamTrackAudioSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackAudioSourceNode "The MediaStreamTrackAudioSourceNode interface is a type of AudioNode which represents a source of audio data taken from a specific MediaStreamTrack obtained through the WebRTC or Media Capture and Streams APIs.")

In only one current engine.

Firefox68+SafariNoneChromeNone

---

OperaNoneEdgeNone

---

Edge (Legacy)NoneIENone

---

Firefox for Android68+iOS SafariNoneChrome for AndroidNoneAndroid WebViewNoneSamsung InternetNoneOpera MobileNone

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `MediaStreamTrackAudioSourceNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourcenode-mediastreamtrackaudiosourcenode) ([AudioContext](https://www.w3.org/TR/webaudio/#audiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourcenode-mediastreamtrackaudiosourcenode-context-options-context), [MediaStreamTrackAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediastreamtrackaudiosourceoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourcenode-mediastreamtrackaudiosourcenode-context-options-options));
};

#### 1.25.1. Constructors[](https://www.w3.org/TR/webaudio/#MediaStreamTrackAudioSourceNode-constructors)

`MediaStreamTrackAudioSourceNode(context, options)`

1.  If the `[mediaStreamTrack](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourceoptions-mediastreamtrack)`'s `kind` attribute is not `"audio"`, throw an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` and abort these steps.
2.  [Initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.25.2. `[MediaStreamTrackAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediastreamtrackaudiosourceoptions)`[](https://www.w3.org/TR/webaudio/#MediaStreamTrackAudioSourceOptions)

This specifies the options for constructing a `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)`. This is required.

[MediaStreamTrackAudioSourceOptions](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackAudioSourceOptions "The MediaStreamTrackAudioSourceOptions dictionary is used when specifying options to the MediaStreamTrackAudioSourceNode() constructor.")

In only one current engine.

Firefox68+SafariNoneChromeNone

---

OperaNoneEdgeNone

---

Edge (Legacy)NoneIENone

---

Firefox for Android68+iOS SafariNoneChrome for AndroidNoneAndroid WebViewNoneSamsung InternetNoneOpera MobileNone

dictionary `MediaStreamTrackAudioSourceOptions` {
required [MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack) [mediaStreamTrack](https://www.w3.org/TR/webaudio/#dom-mediastreamtrackaudiosourceoptions-mediastreamtrack);
};

##### 1.25.2.1. Dictionary `[MediaStreamTrackAudioSourceOptions](https://www.w3.org/TR/webaudio/#dictdef-mediastreamtrackaudiosourceoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-mediastreamtrackaudiosourceoptions-members)

[MediaStreamTrackAudioSourceOptions/mediaStreamTrack](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrackAudioSourceOptions/mediaStreamTrack "The MediaStreamTrackAudioSourceOptions dictionary's mediaStreamTrack property must contain a reference to the MediaStreamTrack from which the MediaStreamTrackAudioSourceNode being created using the MediaStreamTrackAudioSourceNode() constructor.")

In only one current engine.

Firefox68+SafariNoneChromeNone

---

OperaNoneEdgeNone

---

Edge (Legacy)NoneIENone

---

Firefox for Android68+iOS SafariNoneChrome for AndroidNoneAndroid WebViewNoneSamsung InternetNoneOpera MobileNone

`mediaStreamTrack`, of type [MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)

The media stream track that will act as a source. If this `[MediaStreamTrack](https://www.w3.org/TR/mediacapture-streams/#dom-mediastreamtrack)` `kind` attribute is not `"audio"`, an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` MUST be thrown.

### 1.26. The `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)` Interface[](https://www.w3.org/TR/webaudio/#OscillatorNode)

`[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)` represents an audio source generating a periodic waveform. It can be set to a few commonly used waveforms. Additionally, it can be set to an arbitrary periodic waveform through the use of a `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` object.

Oscillators are common foundational building blocks in audio synthesis. An OscillatorNode will start emitting sound at the time specified by the `[start()](https://www.w3.org/TR/webaudio/#dom-audioscheduledsourcenode-start)` method.

Mathematically speaking, a _continuous-time_ periodic waveform can have very high (or infinitely high) frequency information when considered in the frequency domain. When this waveform is sampled as a discrete-time digital audio signal at a particular sample-rate, then care MUST be taken to discard (filter out) the high-frequency information higher than the [Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency) before converting the waveform to a digital form. If this is not done, then [_aliasing_](https://en.wikipedia.org/wiki/Aliasing) of higher frequencies (than the [Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency)) will fold back as mirror images into frequencies lower than the [Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency). In many cases this will cause audibly objectionable artifacts. This is a basic and well-understood principle of audio DSP.

There are several practical approaches that an implementation may take to avoid this aliasing. Regardless of approach, the _idealized_ discrete-time digital audio signal is well defined mathematically. The trade-off for the implementation is a matter of implementation cost (in terms of CPU usage) versus fidelity to achieving this ideal.

It is expected that an implementation will take some care in achieving this ideal, but it is reasonable to consider lower-quality, less-costly approaches on lower-end hardware.

Both `[frequency](https://www.w3.org/TR/webaudio/#dom-oscillatornode-frequency)` and `[detune](https://www.w3.org/TR/webaudio/#dom-oscillatornode-detune)` are [a-rate](https://www.w3.org/TR/webaudio/#a-rate) parameters, and form a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter). They are used together to determine a computedOscFrequency value:

computedOscFrequency(t) = frequency(t) \* pow(2, detune(t) / 1200)

The OscillatorNode’s instantaneous phase at each time is the definite time integral of [computedOscFrequency](https://www.w3.org/TR/webaudio/#computedoscfrequency), assuming a phase angle of zero at the node’s exact start time. Its [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) is \[-[Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency), [Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency)\].

The single output of this node consists of one channel (mono).

enum `OscillatorType` {
["sine"](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sine),
["square"](https://www.w3.org/TR/webaudio/#dom-oscillatortype-square),
["sawtooth"](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sawtooth),
["triangle"](https://www.w3.org/TR/webaudio/#dom-oscillatortype-triangle),
["custom"](https://www.w3.org/TR/webaudio/#dom-oscillatortype-custom)
};

Enumeration description

"`sine`"

A sine wave

"`square`"

A square wave of duty period 0.5

"`sawtooth`"

A sawtooth wave

"`triangle`"

A triangle wave

"`custom`"

A custom periodic wave

[OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode "The OscillatorNode interface represents a periodic waveform, such as a sine wave. It is an AudioScheduledSourceNode audio-processing module that causes a specified frequency of a given wave to be created—in effect, a constant tone.")

In all current engines.

Firefox25+Safari6+Chrome20+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `OscillatorNode` : [AudioScheduledSourceNode](https://www.w3.org/TR/webaudio/#audioscheduledsourcenode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-oscillatornode-oscillatornode) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-oscillatornode-oscillatornode-context-options-context), optional [OscillatorOptions](https://www.w3.org/TR/webaudio/#dictdef-oscillatoroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-oscillatornode-oscillatornode-context-options-options) = {});
attribute [OscillatorType](https://www.w3.org/TR/webaudio/#enumdef-oscillatortype) [type](https://www.w3.org/TR/webaudio/#dom-oscillatornode-type);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [frequency](https://www.w3.org/TR/webaudio/#dom-oscillatornode-frequency);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [detune](https://www.w3.org/TR/webaudio/#dom-oscillatornode-detune);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [setPeriodicWave](https://www.w3.org/TR/webaudio/#dom-oscillatornode-setperiodicwave) ([PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave) `periodicWave`[](https://www.w3.org/TR/webaudio/#dom-oscillatornode-setperiodicwave-periodicwave-periodicwave));
};

#### 1.26.1. Constructors[](https://www.w3.org/TR/webaudio/#OscillatorNode-constructors)

[OscillatorNode/OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/OscillatorNode "The OscillatorNode() constructor of the Web Audio API creates a new OscillatorNode object which is an AudioNode that represents a periodic waveform, like a sine wave, optionally setting the node's properties' values to match values in a specified object.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

`OscillatorNode(context, options)`

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.26.2. Attributes[](https://www.w3.org/TR/webaudio/#OscillatorNode-attributes)

[OscillatorNode/detune](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/detune "The detune property of the OscillatorNode interface is an a-rate AudioParam representing detuning of oscillation in cents.")

In all current engines.

Firefox25+Safari6+Chrome20+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`detune`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

A detuning value (in [cents](<https://en.wikipedia.org/wiki/Cent_(music)>)) which will offset the `[frequency](https://www.w3.org/TR/webaudio/#dom-oscillatornode-frequency)` by the given amount. Its default `value` is 0. This parameter is [a-rate](https://www.w3.org/TR/webaudio/#a-rate). It forms a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) with `[frequency](https://www.w3.org/TR/webaudio/#dom-oscillatornode-frequency)` to form the [computedOscFrequency](https://www.w3.org/TR/webaudio/#computedoscfrequency). The nominal range listed below allows this parameter to detune the `[frequency](https://www.w3.org/TR/webaudio/#dom-oscillatornode-frequency)` over the entire possible range of frequencies.

[OscillatorNode/frequency](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/frequency "The frequency property of the OscillatorNode interface is an a-rate AudioParam representing the frequency of oscillation in hertz.")

In all current engines.

Firefox25+Safari6+Chrome20+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`frequency`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The frequency (in Hertz) of the periodic waveform. Its default `value` is 440. This parameter is [a-rate](https://www.w3.org/TR/webaudio/#a-rate). It forms a [compound parameter](https://www.w3.org/TR/webaudio/#compound-parameter) with `[detune](https://www.w3.org/TR/webaudio/#dom-oscillatornode-detune)` to form the [computedOscFrequency](https://www.w3.org/TR/webaudio/#computedoscfrequency). Its [nominal range](https://www.w3.org/TR/webaudio/#nominal-range) is \[-[Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency), [Nyquist frequency](https://www.w3.org/TR/webaudio/#--nyquist-frequency)\].

[OscillatorNode/type](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/type "The type property of the OscillatorNode interface specifies what shape of waveform the oscillator will output. There are several common waveforms available, as well as an option to specify a custom waveform shape. The shape of the waveform will affect the tone that is produced.")

In all current engines.

Firefox25+Safari6+Chrome20+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android25+Android WebView37+Samsung Internet1.5+Opera Mobile14+

`type`, of type [OscillatorType](https://www.w3.org/TR/webaudio/#enumdef-oscillatortype)

The shape of the periodic waveform. It may directly be set to any of the type constant values except for "`[custom](https://www.w3.org/TR/webaudio/#dom-oscillatortype-custom)`". Doing so MUST throw an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception. The `[setPeriodicWave()](https://www.w3.org/TR/webaudio/#dom-oscillatornode-setperiodicwave)` method can be used to set a custom waveform, which results in this attribute being set to "`[custom](https://www.w3.org/TR/webaudio/#dom-oscillatortype-custom)`". The default value is "`[sine](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sine)`". When this attribute is set, the phase of the oscillator MUST be conserved.

#### 1.26.3. Methods[](https://www.w3.org/TR/webaudio/#OscillatorNode-methods)

[OscillatorNode/setPeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode/setPeriodicWave "The setPeriodicWave() method of the OscillatorNode interface is used to point to a PeriodicWave defining a periodic waveform that can be used to shape the oscillator's output, when type is custom.")

In all current engines.

Firefox25+Safari8+Chrome30+

---

Opera17+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari8+Chrome for Android30+Android WebView37+Samsung Internet2.0+Opera Mobile18+

`setPeriodicWave(periodicWave)`

Sets an arbitrary custom periodic waveform given a `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)`.

Arguments for the [OscillatorNode.setPeriodicWave()](https://www.w3.org/TR/webaudio/#dom-oscillatornode-setperiodicwave) method.

Parameter

Type

Nullable

Optional

Description

`periodicWave`[](https://www.w3.org/TR/webaudio/#dom-oscillatornode-setperiodicwave-periodicwave)

PeriodicWave

✘

✘

custom waveform to be used by the oscillator

#### 1.26.4. `[OscillatorOptions](https://www.w3.org/TR/webaudio/#dictdef-oscillatoroptions)`[](https://www.w3.org/TR/webaudio/#OscillatorOptions)

This specifies the options to be used when constructing an `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`. All of the members are optional; if not specified, the normal default values are used for constructing the oscillator.

dictionary `OscillatorOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[OscillatorType](https://www.w3.org/TR/webaudio/#enumdef-oscillatortype) [type](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-type) = "sine";
[float](https://heycam.github.io/webidl/#idl-float) [frequency](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-frequency) = 440;
[float](https://heycam.github.io/webidl/#idl-float) [detune](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-detune) = 0;
[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave) [periodicWave](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-periodicwave);
};

##### 1.26.4.1. Dictionary `[OscillatorOptions](https://www.w3.org/TR/webaudio/#dictdef-oscillatoroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-oscillatoroptions-members)

`detune`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial detune value for the `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.

`frequency`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `440`

The initial frequency for the `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.

`periodicWave`, of type [PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)

The `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` for the `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`. If this is specified, then any valid value for `[type](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-type)` is ignored; it is treated as if "`[custom](https://www.w3.org/TR/webaudio/#dom-oscillatortype-custom)`" were specified.

`type`, of type [OscillatorType](https://www.w3.org/TR/webaudio/#enumdef-oscillatortype), defaulting to `"sine"`

The type of oscillator to be constructed. If this is set to "custom" without also specifying a `[periodicWave](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-periodicwave)`, then an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception MUST be thrown. If `[periodicWave](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-periodicwave)` is specified, then any valid value for `[type](https://www.w3.org/TR/webaudio/#dom-oscillatoroptions-type)` is ignored; it is treated as if it were set to "custom".

#### 1.26.5. Basic Waveform Phase[](https://www.w3.org/TR/webaudio/#basic-waveform-phase)

The idealized mathematical waveforms for the various oscillator types are defined below. In summary, all waveforms are defined mathematically to be an odd function with a positive slope at time 0. The actual waveforms produced by the oscillator may differ to prevent aliasing affects.

The oscillator MUST produce the same result as if a `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)`, with the appropriate [Fourier series](https://www.w3.org/TR/webaudio/#oscillator-coefficients) and with `[disableNormalization](https://www.w3.org/TR/webaudio/#dom-periodicwaveconstraints-disablenormalization)` set to false, were used to create these basic waveforms.

"`[sine](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sine)`"

The waveform for sine oscillator is:

x(t)\=sin⁡t

"`[square](https://www.w3.org/TR/webaudio/#dom-oscillatortype-square)`"

The waveform for the square wave oscillator is:

x(t)\={1for 0≤t<π−1for −π<t<0.

This is extended to all t by using the fact that the waveform is an odd function with period 2π.

"`[sawtooth](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sawtooth)`"

The waveform for the sawtooth oscillator is the ramp:

x(t)\=tπ for −π<t≤π;

This is extended to all t by using the fact that the waveform is an odd function with period 2π.

"`[triangle](https://www.w3.org/TR/webaudio/#dom-oscillatortype-triangle)`"

The waveform for the triangle oscillator is:

x(t)\={2πtfor 0≤t≤π21−2π(t−π2)for π2<t≤π.

This is extended to all t by using the fact that the waveform is an odd function with period 2π.

### 1.27. The `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` Interface[](https://www.w3.org/TR/webaudio/#PannerNode)

This interface represents a processing node which [positions / spatializes](https://www.w3.org/TR/webaudio/#Spatialization) an incoming audio stream in three-dimensional space. The spatialization is in relation to the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` (`[listener](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-listener)` attribute).

The input of this node is either mono (1 channel) or stereo (2 channels) and cannot be increased. Connections from nodes with fewer or more channels will be [up-mixed or down-mixed appropriately](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing).

If the node is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing), the output of this node is hard-coded to stereo (2 channels) and cannot be configured. If the node is not [actively processing](https://www.w3.org/TR/webaudio/#actively-processing), then the output is a single channel of silence.

The `[PanningModelType](https://www.w3.org/TR/webaudio/#enumdef-panningmodeltype)` enum determines which spatialization algorithm will be used to position the audio in 3D space. The default is "`[equalpower](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-equalpower)`".

enum `PanningModelType` {
["equalpower"](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-equalpower),
["HRTF"](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-hrtf)
};

Enumeration description

"`equalpower`"

A simple and efficient spatialization algorithm using equal-power panning.

Note: When this panning model is used, all the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s used to compute the output of this node are [a-rate](https://www.w3.org/TR/webaudio/#a-rate).

"`HRTF`"

A higher quality spatialization algorithm using a convolution with measured impulse responses from human subjects. This panning method renders stereo output.

Note:When this panning model is used, all the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s used to compute the output of this node are [k-rate](https://www.w3.org/TR/webaudio/#k-rate).

The effective automation rate for an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` of a `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` is determined by the `[panningModel](https://www.w3.org/TR/webaudio/#dom-pannernode-panningmodel)` and `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)` of the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`. If the `[panningModel](https://www.w3.org/TR/webaudio/#dom-pannernode-panningmodel)` is "`[HRTF](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-hrtf)`", the [effective automation rate](https://www.w3.org/TR/webaudio/#effective-automation-rate) is "`[k-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)`", independent of the setting of the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)`. Otherwise the [effective automation rate](https://www.w3.org/TR/webaudio/#effective-automation-rate) is the value of `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)`.

The `[DistanceModelType](https://www.w3.org/TR/webaudio/#enumdef-distancemodeltype)` enum determines which algorithm will be used to reduce the volume of an audio source as it moves away from the listener. The default is "`[inverse](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-inverse)`".

In the description of each distance model below, let d be the distance between the listener and the panner; dref be the value of the `[refDistance](https://www.w3.org/TR/webaudio/#dom-pannernode-refdistance)` attribute; dmax be the value of the `[maxDistance](https://www.w3.org/TR/webaudio/#dom-pannernode-maxdistance)` attribute; and f be the value of the `[rolloffFactor](https://www.w3.org/TR/webaudio/#dom-pannernode-rollofffactor)` attribute.

enum `DistanceModelType` {
["linear"](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-linear),
["inverse"](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-inverse),
["exponential"](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-exponential)
};

Enumeration description

"`linear`"

A linear distance model which calculates _distanceGain_ according to:

1−f max\[min(d,dmax′),dref′\]−dref′dmax′−dref′

where dref′\=min(dref,dmax) and dmax′\=max(dref,dmax). In the case where dref′\=dmax′, the value of the linear model is taken to be 1−f.

Note that d is clamped to the interval \[dref′,dmax′\].

"`inverse`"

An inverse distance model which calculates _distanceGain_ according to:

drefdref+f \[max(d,dref)−dref\]

That is, d is clamped to the interval \[dref,∞). If dref\=0, the value of the inverse model is taken to be 0, independent of the value of d and f.

"`exponential`"

An exponential distance model which calculates _distanceGain_ according to:

\[max(d,dref)dref\]−f

That is, d is clamped to the interval \[dref,∞). If dref\=0, the value of the exponential model is taken to be 0, independent of d and f.

[PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode "The PannerNode interface represents the position and behavior of an audio source signal in space. It is an AudioNode audio-processing module describing its position with right-hand Cartesian coordinates, its movement using a velocity vector and its directionality using a directionality cone.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `PannerNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-pannernode-pannernode) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-pannernode-pannernode-context-options-context), optional [PannerOptions](https://www.w3.org/TR/webaudio/#dictdef-panneroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-pannernode-pannernode-context-options-options) = {});
attribute [PanningModelType](https://www.w3.org/TR/webaudio/#enumdef-panningmodeltype) [panningModel](https://www.w3.org/TR/webaudio/#dom-pannernode-panningmodel);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [positionX](https://www.w3.org/TR/webaudio/#dom-pannernode-positionx);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [positionY](https://www.w3.org/TR/webaudio/#dom-pannernode-positiony);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [positionZ](https://www.w3.org/TR/webaudio/#dom-pannernode-positionz);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [orientationX](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationx);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [orientationY](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationy);
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [orientationZ](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationz);
attribute [DistanceModelType](https://www.w3.org/TR/webaudio/#enumdef-distancemodeltype) [distanceModel](https://www.w3.org/TR/webaudio/#dom-pannernode-distancemodel);
attribute [double](https://heycam.github.io/webidl/#idl-double) [refDistance](https://www.w3.org/TR/webaudio/#dom-pannernode-refdistance);
attribute [double](https://heycam.github.io/webidl/#idl-double) [maxDistance](https://www.w3.org/TR/webaudio/#dom-pannernode-maxdistance);
attribute [double](https://heycam.github.io/webidl/#idl-double) [rolloffFactor](https://www.w3.org/TR/webaudio/#dom-pannernode-rollofffactor);
attribute [double](https://heycam.github.io/webidl/#idl-double) [coneInnerAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneinnerangle);
attribute [double](https://heycam.github.io/webidl/#idl-double) [coneOuterAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneouterangle);
attribute [double](https://heycam.github.io/webidl/#idl-double) [coneOuterGain](https://www.w3.org/TR/webaudio/#dom-pannernode-coneoutergain);
[undefined](https://heycam.github.io/webidl/#idl-undefined) [setPosition](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition) ([float](https://heycam.github.io/webidl/#idl-float) `x`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition-x-y-z-x), [float](https://heycam.github.io/webidl/#idl-float) `y`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition-x-y-z-y), [float](https://heycam.github.io/webidl/#idl-float) `z`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition-x-y-z-z));
[undefined](https://heycam.github.io/webidl/#idl-undefined) [setOrientation](https://www.w3.org/TR/webaudio/#dom-pannernode-setorientation) ([float](https://heycam.github.io/webidl/#idl-float) `x`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setorientation-x-y-z-x), [float](https://heycam.github.io/webidl/#idl-float) `y`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setorientation-x-y-z-y), [float](https://heycam.github.io/webidl/#idl-float) `z`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setorientation-x-y-z-z));
};

#### 1.27.1. Constructors[](https://www.w3.org/TR/webaudio/#PannerNode-constructors)

[PannerNode/PannerNode](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/PannerNode "The PannerNode() constructor of the Web Audio API creates a new PannerNode object instance.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

`PannerNode(context, options)`

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.27.2. Attributes[](https://www.w3.org/TR/webaudio/#PannerNode-attributes)

[PannerNode/coneInnerAngle](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/coneInnerAngle "The coneInnerAngle property of the PannerNode interface is a double value describing the angle, in degrees, of a cone inside of which there will be no volume reduction.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`coneInnerAngle`, of type [double](https://heycam.github.io/webidl/#idl-double)

A parameter for directional audio sources that is an angle, in degrees, inside of which there will be no volume reduction. The default value is 360. The behavior is undefined if the angle is outside the interval \[0, 360\].

[PannerNode/coneOuterAngle](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/coneOuterAngle "The coneOuterAngle property of the PannerNode interface is a double value describing the angle, in degrees, of a cone outside of which the volume will be reduced by a constant value, defined by the coneOuterGain property.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`coneOuterAngle`, of type [double](https://heycam.github.io/webidl/#idl-double)

A parameter for directional audio sources that is an angle, in degrees, outside of which the volume will be reduced to a constant value of `[coneOuterGain](https://www.w3.org/TR/webaudio/#dom-pannernode-coneoutergain)`. The default value is 360. The behavior is undefined if the angle is outside the interval \[0, 360\].

[PannerNode/coneOuterGain](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/coneOuterGain "The coneOuterGain property of the PannerNode interface is a double value, describing the amount of volume reduction outside the cone, defined by the coneOuterAngle attribute.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`coneOuterGain`, of type [double](https://heycam.github.io/webidl/#idl-double)

A parameter for directional audio sources that is the gain outside of the `[coneOuterAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneouterangle)`. The default value is 0. It is a linear value (not dB) in the range \[0, 1\]. An `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` MUST be thrown if the parameter is outside this range.

[PannerNode/distanceModel](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/distanceModel "The distanceModel property of the PannerNode interface is an enumerated value determining which algorithm to use to reduce the volume of the audio source as it moves away from the listener.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`distanceModel`, of type [DistanceModelType](https://www.w3.org/TR/webaudio/#enumdef-distancemodeltype)

Specifies the distance model used by this `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`. Defaults to "`[inverse](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-inverse)`".

[PannerNode/maxDistance](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/maxDistance "The maxDistance property of the PannerNode interface is a double value representing the maximum distance between the audio source and the listener, after which the volume is not reduced any further. This value is used only by the linear distance model.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`maxDistance`, of type [double](https://heycam.github.io/webidl/#idl-double)

The maximum distance between source and listener, after which the volume will not be reduced any further. The default value is 10000. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if this is set to a non-positive value.

[PannerNode/orientationX](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/orientationX "The orientationX property of the PannerNode interface indicates the X (horizontal) component of the direction in which the audio source is facing, in a 3D Cartesian coordinate space.")

Firefox50+SafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android50+iOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`orientationX`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Describes the x\-component of the vector of the direction the audio source is pointing in 3D Cartesian coordinate space.

[PannerNode/orientationY](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/orientationY "The orientationY property of the PannerNode interface indicates the Y (vertical) component of the direction the audio source is facing, in 3D Cartesian coordinate space.")

Firefox50+SafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android50+iOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`orientationY`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Describes the y\-component of the vector of the direction the audio source is pointing in 3D cartesian coordinate space.

[PannerNode/orientationZ](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/orientationZ "The orientationZ property of the PannerNode interface indicates the Z (depth) component of the direction the audio source is facing, in 3D Cartesian coordinate space.")

Firefox50+SafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android50+iOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`orientationZ`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Describes the z\-component of the vector of the direction the audio source is pointing in 3D cartesian coordinate space.

[PannerNode/panningModel](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/panningModel "The panningModel property of the PannerNode interface is an enumerated value determining which spatialisation algorithm to use to position the audio in 3D space.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`panningModel`, of type [PanningModelType](https://www.w3.org/TR/webaudio/#enumdef-panningmodeltype)

Specifies the panning model used by this `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`. Defaults to "`[equalpower](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-equalpower)`".

[PannerNode/positionX](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/positionX "The positionX property of the PannerNode interface specifies the X coordinate of the audio source's position in 3D Cartesian coordinates, corresponding to the horizontal axis (left-right).")

Firefox50+SafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android50+iOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`positionX`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the x\-coordinate position of the audio source in a 3D Cartesian system.

[PannerNode/positionY](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/positionY "The positionY property of the PannerNode interface specifies the Y coordinate of the audio source's position in 3D Cartesian coordinates, corresponding to the vertical axis (top-bottom). The complete vector is defined by the position of the audio source, given as (positionX, positionY, positionZ), and the orientation of the audio source (that is, the direction in which it's facing), given as (orientationX, orientationY, orientationZ).")

Firefox50+SafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android50+iOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`positionY`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the y\-coordinate position of the audio source in a 3D Cartesian system.

[PannerNode/positionZ](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/positionZ "The positionZ property of the PannerNode interface specifies the Z coordinate of the audio source's position in 3D Cartesian coordinates, corresponding to the depth axis (behind-in front of the listener). The complete vector is defined by the position of the audio source, given as (positionX, positionY, positionZ), and the orientation of the audio source (that is, the direction in which it's facing), given as (orientationX, orientationY, orientationZ).")

Firefox50+SafariNoneChrome52+

---

Opera39+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android50+iOS SafariNoneChrome for Android52+Android WebView52+Samsung Internet6.0+Opera Mobile41+

`positionZ`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

Sets the z\-coordinate position of the audio source in a 3D Cartesian system.

[PannerNode/refDistance](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/refDistance "The refDistance property of the PannerNode interface is a double value representing the reference distance for reducing volume as the audio source moves further from the listener – i.e. the distance at which the volume reduction starts taking effect. This value is used by all distance models.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`refDistance`, of type [double](https://heycam.github.io/webidl/#idl-double)

A reference distance for reducing volume as source moves further from the listener. For distances less than this, the volume is not reduced. The default value is 1. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if this is set to a negative value.

[PannerNode/rolloffFactor](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode/rolloffFactor "The rolloffFactor property of the PannerNode interface is a double value describing how quickly the volume is reduced as the source moves away from the listener. This value is used by all distance models.The rolloffFactor property's default value is 1.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS Safari6+Chrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`rolloffFactor`, of type [double](https://heycam.github.io/webidl/#idl-double)

Describes how quickly the volume is reduced as source moves away from listener. The default value is 1. A `[RangeError](https://heycam.github.io/webidl/#exceptiondef-rangeerror)` exception MUST be thrown if this is set to a negative value.

The nominal range for the `[rolloffFactor](https://www.w3.org/TR/webaudio/#dom-pannernode-rollofffactor)` specifies the minimum and maximum values the `rolloffFactor` can have. Values outside the range are clamped to lie within this range. The nominal range depends on the `[distanceModel](https://www.w3.org/TR/webaudio/#dom-pannernode-distancemodel)` as follows:

"`[linear](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-linear)`"

The nominal range is \[0,1\].

"`[inverse](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-inverse)`"

The nominal range is \[0,∞).

"`[exponential](https://www.w3.org/TR/webaudio/#dom-distancemodeltype-exponential)`"

The nominal range is \[0,∞).

Note that the clamping happens as part of the processing of the distance computation. The attribute reflects the value that was set and is not modified.

#### 1.27.3. Methods[](https://www.w3.org/TR/webaudio/#PannerNode-methods)

`setOrientation(x, y, z)`

This method is DEPRECATED. It is equivalent to setting `[orientationX](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationx)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[orientationY](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationy)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, and `[orientationZ](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationz)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute directly, with the `x`, `y` and `z` parameters, respectively.

Consequently, if any of the `[orientationX](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationx)`, `[orientationY](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationy)`, and `[orientationZ](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationz)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s have an automation curve set using `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)` at the time this method is called, a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` MUST be thrown.

Describes which direction the audio source is pointing in the 3D cartesian coordinate space. Depending on how directional the sound is (controlled by the **cone** attributes), a sound pointing away from the listener can be very quiet or completely silent.

The `x, y, z` parameters represent a direction vector in 3D space.

The default value is (1,0,0).

`setPosition(x, y, z)`

This method is DEPRECATED. It is equivalent to setting `[positionX](https://www.w3.org/TR/webaudio/#dom-pannernode-positionx)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, `[positionY](https://www.w3.org/TR/webaudio/#dom-pannernode-positiony)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)`, and `[positionZ](https://www.w3.org/TR/webaudio/#dom-pannernode-positionz)`.`[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute directly with the `x`, `y` and `z` parameters, respectively.

Consequently, if any of the `[positionX](https://www.w3.org/TR/webaudio/#dom-pannernode-positionx)`, `[positionY](https://www.w3.org/TR/webaudio/#dom-pannernode-positiony)`, and `[positionZ](https://www.w3.org/TR/webaudio/#dom-pannernode-positionz)` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s have an automation curve set using `[setValueCurveAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-setvaluecurveattime)` at the time this method is called, a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` MUST be thrown.

Sets the position of the audio source relative to the `[listener](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-listener)` attribute. A 3D cartesian coordinate system is used.

The `x, y, z` parameters represent the coordinates in 3D space.

The default value is (0,0,0).

Arguments for the [PannerNode.setPosition()](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition) method.

Parameter

Type

Nullable

Optional

Description

`x`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition-x)

float

✘

✘

`y`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition-y)

float

✘

✘

`z`[](https://www.w3.org/TR/webaudio/#dom-pannernode-setposition-z)

float

✘

✘

#### 1.27.4. `[PannerOptions](https://www.w3.org/TR/webaudio/#dictdef-panneroptions)`[](https://www.w3.org/TR/webaudio/#PannerOptions)

This specifies options for constructing a `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`. All members are optional; if not specified, the normal default is used in constructing the node.

dictionary `PannerOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[PanningModelType](https://www.w3.org/TR/webaudio/#enumdef-panningmodeltype) [panningModel](https://www.w3.org/TR/webaudio/#dom-panneroptions-panningmodel) = "equalpower";
[DistanceModelType](https://www.w3.org/TR/webaudio/#enumdef-distancemodeltype) [distanceModel](https://www.w3.org/TR/webaudio/#dom-panneroptions-distancemodel) = "inverse";
[float](https://heycam.github.io/webidl/#idl-float) [positionX](https://www.w3.org/TR/webaudio/#dom-panneroptions-positionx) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [positionY](https://www.w3.org/TR/webaudio/#dom-panneroptions-positiony) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [positionZ](https://www.w3.org/TR/webaudio/#dom-panneroptions-positionz) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [orientationX](https://www.w3.org/TR/webaudio/#dom-panneroptions-orientationx) = 1;
[float](https://heycam.github.io/webidl/#idl-float) [orientationY](https://www.w3.org/TR/webaudio/#dom-panneroptions-orientationy) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [orientationZ](https://www.w3.org/TR/webaudio/#dom-panneroptions-orientationz) = 0;
[double](https://heycam.github.io/webidl/#idl-double) [refDistance](https://www.w3.org/TR/webaudio/#dom-panneroptions-refdistance) = 1;
[double](https://heycam.github.io/webidl/#idl-double) [maxDistance](https://www.w3.org/TR/webaudio/#dom-panneroptions-maxdistance) = 10000;
[double](https://heycam.github.io/webidl/#idl-double) [rolloffFactor](https://www.w3.org/TR/webaudio/#dom-panneroptions-rollofffactor) = 1;
[double](https://heycam.github.io/webidl/#idl-double) [coneInnerAngle](https://www.w3.org/TR/webaudio/#dom-panneroptions-coneinnerangle) = 360;
[double](https://heycam.github.io/webidl/#idl-double) [coneOuterAngle](https://www.w3.org/TR/webaudio/#dom-panneroptions-coneouterangle) = 360;
[double](https://heycam.github.io/webidl/#idl-double) [coneOuterGain](https://www.w3.org/TR/webaudio/#dom-panneroptions-coneoutergain) = 0;
};

##### 1.27.4.1. Dictionary `[PannerOptions](https://www.w3.org/TR/webaudio/#dictdef-panneroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-pannernode-members)

`coneInnerAngle`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `360`

The initial value for the `[coneInnerAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneinnerangle)` attribute of the node.

`coneOuterAngle`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `360`

The initial value for the `[coneOuterAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneouterangle)` attribute of the node.

`coneOuterGain`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `0`

The initial value for the `[coneOuterGain](https://www.w3.org/TR/webaudio/#dom-pannernode-coneoutergain)` attribute of the node.

`distanceModel`, of type [DistanceModelType](https://www.w3.org/TR/webaudio/#enumdef-distancemodeltype), defaulting to `"inverse"`

The distance model to use for the node.

`maxDistance`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `10000`

The initial value for the `[maxDistance](https://www.w3.org/TR/webaudio/#dom-pannernode-maxdistance)` attribute of the node.

`orientationX`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `1`

The initial x\-component value for the `[orientationX](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationx)` AudioParam.

`orientationY`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial y\-component value for the `[orientationY](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationy)` AudioParam.

`orientationZ`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial z\-component value for the `[orientationZ](https://www.w3.org/TR/webaudio/#dom-pannernode-orientationz)` AudioParam.

`panningModel`, of type [PanningModelType](https://www.w3.org/TR/webaudio/#enumdef-panningmodeltype), defaulting to `"equalpower"`

The panning model to use for the node.

`positionX`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial x\-coordinate value for the `[positionX](https://www.w3.org/TR/webaudio/#dom-pannernode-positionx)` AudioParam.

`positionY`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial y\-coordinate value for the `[positionY](https://www.w3.org/TR/webaudio/#dom-pannernode-positiony)` AudioParam.

`positionZ`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial z\-coordinate value for the `[positionZ](https://www.w3.org/TR/webaudio/#dom-pannernode-positionz)` AudioParam.

`refDistance`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `1`

The initial value for the `[refDistance](https://www.w3.org/TR/webaudio/#dom-pannernode-refdistance)` attribute of the node.

`rolloffFactor`, of type [double](https://heycam.github.io/webidl/#idl-double), defaulting to `1`

The initial value for the `[rolloffFactor](https://www.w3.org/TR/webaudio/#dom-pannernode-rollofffactor)` attribute of the node.

#### 1.27.5. Channel Limitations[](https://www.w3.org/TR/webaudio/#panner-channel-limitations)

The set of [channel limitations](https://www.w3.org/TR/webaudio/#panner-channel-limitations) for `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)` also apply to `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`.

### 1.28. The `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` Interface[](https://www.w3.org/TR/webaudio/#PeriodicWave)

`[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` represents an arbitrary periodic waveform to be used with an `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)`.

A [conforming implementation](https://heycam.github.io/webidl/#dfn-conforming-implementation) MUST support `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` up to at least 8192 elements.

[PeriodicWave/PeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave/PeriodicWave "The PeriodicWave() constructor of the Web Audio API creates a new PeriodicWave object instance.")

Firefox53+Safari?Chrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS Safari?Chrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

[PeriodicWave](https://developer.mozilla.org/en-US/docs/Web/API/PeriodicWave "The PeriodicWave interface defines a periodic waveform that can be used to shape the output of an OscillatorNode.")

In all current engines.

Firefox25+Safari8+Chrome30+

---

Opera17+Edge79+

---

Edge (Legacy)18IENone

---

Firefox for Android26+iOS Safari8+Chrome for Android30+Android WebView37+Samsung Internet2.0+Opera Mobile18+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `PeriodicWave` {
[constructor](https://www.w3.org/TR/webaudio/#dom-periodicwave-periodicwave) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-periodicwave-periodicwave-context-options-context), optional [PeriodicWaveOptions](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveoptions) `options` = {});
};

#### 1.28.1. Constructors[](https://www.w3.org/TR/webaudio/#PeriodicWave-constructors)

`PeriodicWave(context, options)`

#### 1.28.2. `[PeriodicWaveConstraints](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveconstraints)`[](https://www.w3.org/TR/webaudio/#PeriodicWaveConstraints)

The `[PeriodicWaveConstraints](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveconstraints)` dictionary is used to specify how the waveform is [normalized](https://www.w3.org/TR/webaudio/#waveform-normalization).

dictionary `PeriodicWaveConstraints` {
[boolean](https://heycam.github.io/webidl/#idl-boolean) [disableNormalization](https://www.w3.org/TR/webaudio/#dom-periodicwaveconstraints-disablenormalization) = false;
};

##### 1.28.2.1. Dictionary `[PeriodicWaveConstraints](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveconstraints)` Members[](https://www.w3.org/TR/webaudio/#dictionary-periodicwaveconstraints-members)

`disableNormalization`, of type [boolean](https://heycam.github.io/webidl/#idl-boolean), defaulting to `false`

Controls whether the periodic wave is normalized or not. If `true`, the waveform is not normalized; otherwise, the waveform is normalized.

#### 1.28.3. `[PeriodicWaveOptions](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveoptions)`[](https://www.w3.org/TR/webaudio/#PeriodicWaveOptions)

The `[PeriodicWaveOptions](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveoptions)` dictionary is used to specify how the waveform is constructed. If only one of `[real](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-real)` or `[imag](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-imag)` is specified. The other is treated as if it were an array of all zeroes of the same length, as specified below in [description of the dictionary members](https://www.w3.org/TR/webaudio/#dictionary-periodicwaveoptions-members). If neither is given, a `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` is created that MUST be equivalent to an `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)` with `[type](https://www.w3.org/TR/webaudio/#dom-oscillatornode-type)` "`[sine](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sine)`". If both are given, the sequences must have the same length; otherwise an error of type `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` MUST be thrown.

dictionary `PeriodicWaveOptions` : [PeriodicWaveConstraints](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveconstraints) {
[sequence](https://heycam.github.io/webidl/#idl-sequence)<[float](https://heycam.github.io/webidl/#idl-float)\> [real](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-real);
[sequence](https://heycam.github.io/webidl/#idl-sequence)<[float](https://heycam.github.io/webidl/#idl-float)\> [imag](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-imag);
};

##### 1.28.3.1. Dictionary `[PeriodicWaveOptions](https://www.w3.org/TR/webaudio/#dictdef-periodicwaveoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-periodicwaveoptions-members)

`imag`, of type sequence<[float](https://heycam.github.io/webidl/#idl-float)\>

The `[imag](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-imag)` parameter represents an array of `sine` terms. The first element (index 0) does not exist in the Fourier series. The second element (index 1) represents the fundamental frequency. The third represents the first overtone and so on.

`real`, of type sequence<[float](https://heycam.github.io/webidl/#idl-float)\>

The `[real](https://www.w3.org/TR/webaudio/#dom-periodicwaveoptions-real)` parameter represents an array of `cosine` terms. The first element (index 0) is the DC-offset of the periodic waveform. The second element (index 1) represents the fundmental frequency. The third represents the first overtone and so on.

#### 1.28.4. Waveform Generation[](https://www.w3.org/TR/webaudio/#waveform-generation)

The `[createPeriodicWave()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave)` method takes two arrays to specify the Fourier coefficients of the `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)`. Let a and b represent the `[[[real]]](https://www.w3.org/TR/webaudio/#dom-periodicwave-real-slot)` and `[[[imag]]](https://www.w3.org/TR/webaudio/#dom-periodicwave-imag-slot)` arrays of length L, respectively. Then the basic time-domain waveform, x(t), can be computed using:

x(t)\=∑k\=1L−1\[a\[k\]cos⁡2πkt+b\[k\]sin⁡2πkt\]

This is the basic (unnormalized) waveform.

#### 1.28.5. Waveform Normalization[](https://www.w3.org/TR/webaudio/#waveform-normalization)

If the internal slot `[[[normalize]]](https://www.w3.org/TR/webaudio/#dom-periodicwave-normalize-slot)` of this `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` is `true` (the default), the waveform defined in the previous section is normalized so that the maximum value is 1. The normalization is done as follows.

Let

x~(n)\=∑k\=1L−1(a\[k\]cos⁡2πknN+b\[k\]sin⁡2πknN)

where N is a power of two. (Note: x~(n) can conveniently be computed using an inverse FFT.) The fixed normalization factor f is computed as follows.

f\=maxn\=0,…,N−1|x~(n)|

Thus, the actual normalized waveform x^(n) is:

x^(n)\=x~(n)f

This fixed normalization factor MUST be applied to all generated waveforms.

#### 1.28.6. Oscillator Coefficients[](https://www.w3.org/TR/webaudio/#oscillator-coefficients)

The builtin oscillator types are created using `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` objects. For completeness the coefficients for the `[PeriodicWave](https://www.w3.org/TR/webaudio/#periodicwave)` for each of the builtin oscillator types is given here. This is useful if a builtin type is desired but without the default normalization.

In the following descriptions, let a be the array of real coefficients and b be the array of imaginary coefficients for `[createPeriodicWave()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createperiodicwave)`. In all cases a\[n\]\=0 for all n because the waveforms are odd functions. Also, b\[0\]\=0 in all cases. Hence, only b\[n\] for n≥1 is specified below.

"`[sine](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sine)`"

b\[n\]\={1for n\=10otherwise

"`[square](https://www.w3.org/TR/webaudio/#dom-oscillatortype-square)`"

b\[n\]\=2nπ\[1−(−1)n\]

"`[sawtooth](https://www.w3.org/TR/webaudio/#dom-oscillatortype-sawtooth)`"

b\[n\]\=(−1)n+12nπ

"`[triangle](https://www.w3.org/TR/webaudio/#dom-oscillatortype-triangle)`"

b\[n\]\=8sin⁡nπ2(πn)2

### 1.29. The `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` Interface - DEPRECATED[](https://www.w3.org/TR/webaudio/#ScriptProcessorNode)

This interface is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which can generate, process, or analyse audio directly using a script. This node type is deprecated, to be replaced by the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`; this text is only here for informative purposes until implementations remove this node type.

The `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` is constructed with a `[bufferSize](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-buffersize)` which MUST be one of the following values: 256, 512, 1024, 2048, 4096, 8192, 16384. This value controls how frequently the `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` event is dispatched and how many sample-frames need to be processed each call. `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` events are only dispatched if the `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` has at least one input or one output connected. Lower numbers for `[bufferSize](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-buffersize)` will result in a lower (better) [latency](https://www.w3.org/TR/webaudio/#latency). Higher numbers will be necessary to avoid audio breakup and [glitches](https://www.w3.org/TR/webaudio/#audio-glitching). This value will be picked by the implementation if the bufferSize argument to `[createScriptProcessor()](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor)` is not passed in, or is set to 0.

`[numberOfInputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofinputchannels)` and `[numberOfOutputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofoutputchannels)` determine the number of input and output channels. It is invalid for both `[numberOfInputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofinputchannels)` and `[numberOfOutputChannels](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-createscriptprocessor-buffersize-numberofinputchannels-numberofoutputchannels-numberofoutputchannels)` to be zero.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `ScriptProcessorNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
attribute [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler) [onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess);
readonly attribute [long](https://heycam.github.io/webidl/#idl-long) [bufferSize](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-buffersize);
};

#### 1.29.1. Attributes[](https://www.w3.org/TR/webaudio/#ScriptProcessorNode-attributes)

`bufferSize`, of type [long](https://heycam.github.io/webidl/#idl-long), readonly

The size of the buffer (in sample-frames) which needs to be processed each time `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` is called. Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).

`onaudioprocess`, of type [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)

A property used to set the `EventHandler` (described in [HTML](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)[\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html)) for the `[onaudioprocess](https://www.w3.org/TR/webaudio/#dom-scriptprocessornode-onaudioprocess)` event that is dispatched to `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` node types. An event of type `[AudioProcessingEvent](https://www.w3.org/TR/webaudio/#audioprocessingevent)` will be dispatched to the event handler.

### 1.30. The `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)` Interface[](https://www.w3.org/TR/webaudio/#StereoPannerNode)

This interface represents a processing node which positions an incoming audio stream in a stereo image using [a low-cost panning algorithm](https://www.w3.org/TR/webaudio/#stereopanner-algorithm). This panning effect is common in positioning audio components in a stereo stream.

The input of this node is stereo (2 channels) and cannot be increased. Connections from nodes with fewer or more channels will be [up-mixed or down-mixed appropriately](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing).

The output of this node is hard-coded to stereo (2 channels) and cannot be configured.

[StereoPannerNode](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode "The StereoPannerNode interface of the Web Audio API represents a simple stereo panner node that can be used to pan an audio stream left or right. It is an AudioNode audio-processing module that positions an incoming audio stream in a stereo image using a low-cost equal-power panning algorithm.")

Firefox37+SafariNoneChrome41+

---

Opera28+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android37+iOS SafariNoneChrome for Android41+Android WebView41+Samsung Internet4.0+Opera Mobile28+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `StereoPannerNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-stereopannernode-stereopannernode) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-stereopannernode-stereopannernode-context-options-context), optional [StereoPannerOptions](https://www.w3.org/TR/webaudio/#dictdef-stereopanneroptions) `options`[](https://www.w3.org/TR/webaudio/#dom-stereopannernode-stereopannernode-context-options-options) = {});
readonly attribute [AudioParam](https://www.w3.org/TR/webaudio/#audioparam) [pan](https://www.w3.org/TR/webaudio/#dom-stereopannernode-pan);
};

#### 1.30.1. Constructors[](https://www.w3.org/TR/webaudio/#StereoPannerNode-constructors)

[StereoPannerNode/StereoPannerNode](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode/StereoPannerNode "The StereoPannerNode() constructor of the Web Audio API creates a new StereoPannerNode object which is an AudioNode that represents a simple stereo panner node that can be used to pan an audio stream left or right.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

`StereoPannerNode(context, options)`

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

#### 1.30.2. Attributes[](https://www.w3.org/TR/webaudio/#StereoPannerNode-attributes)

[StereoPannerNode/pan](https://developer.mozilla.org/en-US/docs/Web/API/StereoPannerNode/pan "The pan property of the StereoPannerNode interface is an a-rate AudioParam representing the amount of panning to apply. The value can range between -1 (full left pan) and 1 (full right pan).")

Firefox37+SafariNoneChrome41+

---

Opera28+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android37+iOS SafariNoneChrome for Android41+Android WebView41+Samsung Internet4.0+Opera Mobile28+

`pan`, of type [AudioParam](https://www.w3.org/TR/webaudio/#audioparam), readonly

The position of the input in the output’s stereo image. -1 represents full left, +1 represents full right.

#### 1.30.3. `[StereoPannerOptions](https://www.w3.org/TR/webaudio/#dictdef-stereopanneroptions)`[](https://www.w3.org/TR/webaudio/#StereoPannerOptions)

This specifies the options to use in constructing a `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)`. All members are optional; if not specified, the normal default is used in constructing the node.

dictionary `StereoPannerOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[float](https://heycam.github.io/webidl/#idl-float) [pan](https://www.w3.org/TR/webaudio/#dom-stereopanneroptions-pan) = 0;
};

##### 1.30.3.1. Dictionary `[StereoPannerOptions](https://www.w3.org/TR/webaudio/#dictdef-stereopanneroptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-stereopanneroptions-members)

`pan`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

The initial value for the `[pan](https://www.w3.org/TR/webaudio/#dom-stereopannernode-pan)` AudioParam.

#### 1.30.4. Channel Limitations[](https://www.w3.org/TR/webaudio/#StereoPanner-channel-limitations)

Because its processing is constrained by the above definitions, `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)` is limited to mixing no more than 2 channels of audio, and producing exactly 2 channels. It is possible to use a `[ChannelSplitterNode](https://www.w3.org/TR/webaudio/#channelsplitternode)`, intermediate processing by a subgraph of `[GainNode](https://www.w3.org/TR/webaudio/#gainnode)`s and/or other nodes, and recombination via a `[ChannelMergerNode](https://www.w3.org/TR/webaudio/#channelmergernode)` to realize arbitrary approaches to panning and mixing.

### 1.31. The `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)` Interface[](https://www.w3.org/TR/webaudio/#WaveShaperNode)

`[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)` is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` processor implementing non-linear distortion effects.

Non-linear waveshaping distortion is commonly used for both subtle non-linear warming, or more obvious distortion effects. Arbitrary non-linear shaping curves may be specified.

The number of channels of the output always equals the number of channels of the input.

enum `OverSampleType` {
["none"](https://www.w3.org/TR/webaudio/#dom-oversampletype-none),
["2x"](https://www.w3.org/TR/webaudio/#dom-oversampletype-2x),
["4x"](https://www.w3.org/TR/webaudio/#dom-oversampletype-4x)
};

Enumeration description

"`none`"

Don’t oversample

"`2x`"

Oversample two times

"`4x`"

Oversample four times

[WaveShaperNode](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode "The WaveShaperNode interface represents a non-linear distorter.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `WaveShaperNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-waveshapernode-waveshapernode) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-waveshapernode-waveshapernode-context-options-context), optional [WaveShaperOptions](https://www.w3.org/TR/webaudio/#dictdef-waveshaperoptions) `options` = {});
attribute [Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)? [curve](https://www.w3.org/TR/webaudio/#dom-waveshapernode-curve);
attribute [OverSampleType](https://www.w3.org/TR/webaudio/#enumdef-oversampletype) [oversample](https://www.w3.org/TR/webaudio/#dom-waveshapernode-oversample);
};

#### 1.31.1. Constructors[](https://www.w3.org/TR/webaudio/#WaveShaperNode-constructors)

[WaveShaperNode/WaveShaperNode](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode/WaveShaperNode "The WaveShaperNode() constructor of the Web Audio API creates a new WaveShaperNode object which is an AudioNode that represents a non-linear distorter.")

Firefox53+SafariNoneChrome55+

---

Opera42+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android53+iOS SafariNoneChrome for Android55+Android WebView55+Samsung Internet6.0+Opera Mobile42+

`WaveShaperNode(context, options)`

When the constructor is called with a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` c and an option object option, the user agent MUST [initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) this, with context and options as arguments.

Also, let `[[curve set]]` be an internal slot of this `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)`. Initialize this slot to `false`. If `[options](https://www.w3.org/TR/webaudio/#dom-waveshapernode-waveshapernode-context-options-options)` is given and specifies a `[curve](https://www.w3.org/TR/webaudio/#dom-waveshaperoptions-curve)`, set `[[[curve set]]](https://www.w3.org/TR/webaudio/#dom-waveshapernode-curve-set-slot)` to `true`.

#### 1.31.2. Attributes[](https://www.w3.org/TR/webaudio/#WaveShaperNode-attributes)

[WaveShaperNode/curve](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode/curve "The curve property of the WaveShaperNode interface is a Float32Array of numbers describing the distortion to apply.")

In all current engines.

Firefox25+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android25+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`curve`, of type [Float32Array](https://heycam.github.io/webidl/#idl-Float32Array), nullable

The shaping curve used for the waveshaping effect. The input signal is nominally within the range \[-1, 1\]. Each input sample within this range will index into the shaping curve, with a signal level of zero corresponding to the center value of the curve array if there are an odd number of entries, or interpolated between the two centermost values if there are an even number of entries in the array. Any sample value less than -1 will correspond to the first value in the curve array. Any sample value greater than +1 will correspond to the last value in the curve array.

The implementation MUST perform linear interpolation between adjacent points in the curve. Initially the curve attribute is null, which means that the WaveShaperNode will pass its input to its output without modification.

Values of the curve are spread with equal spacing in the \[-1; 1\] range. This means that a `[curve](https://www.w3.org/TR/webaudio/#dom-waveshapernode-curve)` with a even number of value will not have a value for a signal at zero, and a `[curve](https://www.w3.org/TR/webaudio/#dom-waveshapernode-curve)` with an odd number of value will have a value for a signal at zero. The output is determined by the following algorithm.

1.  Let x be the input sample, y be the corresponding output of the node, ck be the k'th element of the `[curve](https://www.w3.org/TR/webaudio/#dom-waveshapernode-curve)`, and N be the length of the `[curve](https://www.w3.org/TR/webaudio/#dom-waveshapernode-curve)`.
2.  Let

    v\=N−12(x+1)k\=⌊v⌋f\=v−k

3.  Then

    y\={c0v<0cN−1v≥N−1(1−f)ck+fck+1otherwise

A `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` MUST be thrown if this attribute is set with a `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` that has a `length` less than 2.

When this attribute is set, an internal copy of the curve is created by the `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)`. Subsequent modifications of the contents of the array used to set the attribute therefore have no effect.

Note: The use of a curve that produces a non-zero output value for zero input value will cause this node to produce a DC signal even if there are no inputs connected to this node. This will persist until the node is disconnected from downstream nodes.

[WaveShaperNode/oversample](https://developer.mozilla.org/en-US/docs/Web/API/WaveShaperNode/oversample "The oversample property of the WaveShaperNode interface is an enumerated value indicating if oversampling must be used. Oversampling is a technique for creating more samples (up-sampling) before applying a distortion effect to the audio signal.")

In all current engines.

Firefox26+Safari6+Chrome14+

---

Opera15+Edge79+

---

Edge (Legacy)12+IENone

---

Firefox for Android26+iOS SafariYesChrome for Android18+Android WebView37+Samsung Internet1.0+Opera Mobile14+

`oversample`, of type [OverSampleType](https://www.w3.org/TR/webaudio/#enumdef-oversampletype)

Specifies what type of oversampling (if any) should be used when applying the shaping curve. The default value is "`[none](https://www.w3.org/TR/webaudio/#dom-oversampletype-none)`", meaning the curve will be applied directly to the input samples. A value of "`[2x](https://www.w3.org/TR/webaudio/#dom-oversampletype-2x)`" or "`[4x](https://www.w3.org/TR/webaudio/#dom-oversampletype-4x)`" can improve the quality of the processing by avoiding some aliasing, with the "`[4x](https://www.w3.org/TR/webaudio/#dom-oversampletype-4x)`" value yielding the highest quality. For some applications, it’s better to use no oversampling in order to get a very precise shaping curve.

A value of "`[2x](https://www.w3.org/TR/webaudio/#dom-oversampletype-2x)`" or "`[4x](https://www.w3.org/TR/webaudio/#dom-oversampletype-4x)`" means that the following steps MUST be performed:

1.  Up-sample the input samples to 2x or 4x the sample-rate of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`. Thus for each [render quantum](https://www.w3.org/TR/webaudio/#render-quantum), generate 256 (for 2x) or 512 (for 4x) samples.
2.  Apply the shaping curve.
3.  Down-sample the result back to the sample-rate of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`. Thus taking the 256 (or 512) processed samples, generating 128 as the final result.

The exact up-sampling and down-sampling filters are not specified, and can be tuned for sound quality (low aliasing, etc.), low latency, or performance.

Note: Use of oversampling introduces some degree of audio processing latency due to the up-sampling and down-sampling filters. The amount of this latency can vary from one implementation to another.

#### 1.31.3. `[WaveShaperOptions](https://www.w3.org/TR/webaudio/#dictdef-waveshaperoptions)`[](https://www.w3.org/TR/webaudio/#WaveShaperOptions)

This specifies the options for constructing a `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)`. All members are optional; if not specified, the normal default is used in constructing the node.

dictionary `WaveShaperOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[sequence](https://heycam.github.io/webidl/#idl-sequence)<[float](https://heycam.github.io/webidl/#idl-float)\> [curve](https://www.w3.org/TR/webaudio/#dom-waveshaperoptions-curve);
[OverSampleType](https://www.w3.org/TR/webaudio/#enumdef-oversampletype) [oversample](https://www.w3.org/TR/webaudio/#dom-waveshaperoptions-oversample) = "none";
};

##### 1.31.3.1. Dictionary `[WaveShaperOptions](https://www.w3.org/TR/webaudio/#dictdef-waveshaperoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-waveshaperoptions-members)

`curve`, of type sequence<[float](https://heycam.github.io/webidl/#idl-float)\>

The shaping curve for the waveshaping effect.

`oversample`, of type [OverSampleType](https://www.w3.org/TR/webaudio/#enumdef-oversampletype), defaulting to `"none"`

The type of oversampling to use for the shaping curve.

### 1.32. The `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)` Interface[](https://www.w3.org/TR/webaudio/#AudioWorklet)

[AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorklet "The AudioWorklet interface of the Web Audio API is used to supply custom audio processing scripts that execute in a separate thread to provide very low latency audio processing. The worklet's code is run in the AudioWorkletGlobalScope global execution context, using a separate Web Audio thread which is shared by the worklet and other audio nodes.The AudioWorklet interface of the Web Audio API is used to supply custom audio processing scripts that execute in a separate thread to provide very low latency audio processing.")

Firefox76+SafariNoneChrome66+

---

OperaYesEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera MobileYes

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window, [SecureContext](https://heycam.github.io/webidl/#SecureContext)\]
interface `AudioWorklet` : [Worklet](https://html.spec.whatwg.org/multipage/worklets.html#worklet) {
};

#### 1.32.1. Concepts[](https://www.w3.org/TR/webaudio/#AudioWorklet-concepts)

The `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)` object allows developers to supply scripts (such as JavaScript or WebAssembly code) to process audio on the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread), supporting custom `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s. This processing mechanism ensures synchronous execution of the script code with other built-in `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s in the audio graph.

An associated pair of objects MUST be defined in order to realize this mechanism: `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` and `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`. The former represents the interface for the main global scope similar to other `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` objects, and the latter implements the internal audio processing within a special scope named `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`.

![AudioWorklet concept](https://www.w3.org/TR/webaudio/images/audioworklet-concept.png)

`[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` and `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`

Each `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` possesses exactly one `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)`.

The `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)`'s [worklet global scope type](https://html.spec.whatwg.org/multipage/worklets.html#worklet-global-scope-type) is `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`.

The `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)`'s [worklet destination type](https://html.spec.whatwg.org/multipage/worklets.html#worklet-destination-type) is `"audioworklet"`.

Importing a script via the `[addModule(moduleUrl)](https://html.spec.whatwg.org/multipage/worklets.html#dom-worklet-addmodule)` method registers class definitions of `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` under the `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`. There are two internal storage areas for the imported class constructor and the active instances created from the constructor.

`[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)` has one internal slot:

- node name to parameter descriptor map which is a map containing an identical set of string keys from [node name to processor constructor map](https://www.w3.org/TR/webaudio/#node-name-to-processor-constructor-map) that are associated with the matching [parameterDescriptors](https://www.w3.org/TR/webaudio/#parameterdescriptors) values. This internal storage is populated as a consequence of calling the `[registerProcessor()](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-registerprocessor)` method in the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread). The population is guaranteed to complete prior to the resolution of the promise returned by `[addModule()](https://html.spec.whatwg.org/multipage/worklets.html#dom-worklet-addmodule)` on a context’s `[audioWorklet](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-audioworklet)`.

[](https://www.w3.org/TR/webaudio/#example-d0db141d)// bypass-processor.js script file, runs on AudioWorkletGlobalScope
class BypassProcessor extends AudioWorkletProcessor {
process (inputs, outputs) {
// Single input, single channel.
const input \= inputs\[0\];
const output \= outputs\[0\];
output\[0\].set(input\[0\]);

    // Process only while there are active inputs.
    return false;

}
};

registerProcessor('bypass-processor', BypassProcessor);

[](https://www.w3.org/TR/webaudio/#example-885ab32a)// The main global scope
const context \= new AudioContext();
context.audioWorklet.addModule('bypass-processor.js').then(() \=> {
const bypassNode \= new AudioWorkletNode(context, 'bypass-processor');
});

At the instantiation of `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` in the main global scope, the counterpart `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` will also be created in `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`. These two objects communicate via the asynchronous message passing described in [§ 2 Processing model](https://www.w3.org/TR/webaudio/#processing-model).

#### 1.32.2. The `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` Interface[](https://www.w3.org/TR/webaudio/#AudioWorkletGlobalScope)

This special execution context is designed to enable the generation, processing, and analysis of audio data directly using a script in the audio [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread). The user-supplied script code is evaluated in this scope to define one or more `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` subclasses, which in turn are used to instantiate `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`s, in a 1:1 association with `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`s in the main scope.

Exactly one `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` exists for each `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` that contains one or more `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`s. The running of imported scripts is performed by the UA as defined in [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html). Overriding the default specified in [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html), `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`s must not be [terminated](https://html.spec.whatwg.org/multipage/worklets.html#terminate-a-worklet-global-scope) arbitrarily by the user agent.

An `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` has the following internal slots:

- node name to processor constructor map which is a map that stores key-value pairs of _processor name_ → _`[AudioWorkletProcessorConstructor](https://www.w3.org/TR/webaudio/#callbackdef-audioworkletprocessorconstructor)`_ instance. Initially this map is empty and populated when the `[registerProcessor()](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-registerprocessor)` method is called.
- pending processor construction data stores temporary data generated by the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` constructor for the instantiation of the corresponding `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`. The [pending processor construction data](https://www.w3.org/TR/webaudio/#pending-processor-construction-data) contains the following items:

  - node reference which is initially empty. This storage is for an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` reference that is transferred from the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` constructor.
  - transferred port which is initially empty. This storage is for a deserialized `[MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport)` that is transferred from the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` constructor.

Note: The `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` may also contain any other data and code to be shared by these instances. As an example, multiple processors might share an ArrayBuffer defining a wavetable or an impulse response.

Note: An `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` is associated with a single `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`, and with a single audio rendering thread for that context. This prevents data races from occurring in global scope code running within concurrent threads.

[AudioWorkletGlobalScope](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope "The AudioWorkletGlobalScope interface of the Web Audio API represents a global execution context for user-supplied code, which defines custom AudioWorkletProcessor-derived classes.")

Firefox76+SafariNoneChrome66+

---

Opera53+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera Mobile47+

callback `AudioWorkletProcessorConstructor` = [AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor) ([object](https://heycam.github.io/webidl/#idl-object) `options`[](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessorconstructor-options));

\[[Global](https://heycam.github.io/webidl/#Global)\=([Worklet](https://html.spec.whatwg.org/multipage/worklets.html#worklet), [AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)), [Exposed](https://heycam.github.io/webidl/#Exposed)\=AudioWorklet\]
interface `AudioWorkletGlobalScope` : [WorkletGlobalScope](https://html.spec.whatwg.org/multipage/worklets.html#workletglobalscope) {
[undefined](https://heycam.github.io/webidl/#idl-undefined) [registerProcessor](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-registerprocessor) ([DOMString](https://heycam.github.io/webidl/#idl-DOMString) [name](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-registerprocessor-name-processorctor-name),
[AudioWorkletProcessorConstructor](https://www.w3.org/TR/webaudio/#callbackdef-audioworkletprocessorconstructor) [processorCtor](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-registerprocessor-name-processorctor-processorctor));
readonly attribute [unsigned long long](https://heycam.github.io/webidl/#idl-unsigned-long-long) [currentFrame](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-currentframe);
readonly attribute [double](https://heycam.github.io/webidl/#idl-double) [currentTime](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-currenttime);
readonly attribute [float](https://heycam.github.io/webidl/#idl-float) [sampleRate](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-samplerate);
};

##### 1.32.2.1. Attributes[](https://www.w3.org/TR/webaudio/#AudioWorkletGlobalScope-attributes)

`currentFrame`, of type [unsigned long long](https://heycam.github.io/webidl/#idl-unsigned-long-long), readonly

The current frame of the block of audio being processed. This must be equal to the value of the `[[[current frame]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-current-frame-slot)` internal slot of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

`currentTime`, of type [double](https://heycam.github.io/webidl/#idl-double), readonly

The context time of the block of audio being processed. By definition this will be equal to the value of `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` attribute that was most recently observable in the [control thread](https://www.w3.org/TR/webaudio/#control-thread).

`sampleRate`, of type [float](https://heycam.github.io/webidl/#idl-float), readonly

The sample rate of the associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

##### 1.32.2.2. Methods[](https://www.w3.org/TR/webaudio/#AudioWorkletGlobalScope-methods)

[AudioWorkletGlobalScope/registerProcessor](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletGlobalScope/registerProcessor "The registerProcessor method of the AudioWorkletGlobalScope interface registers a class constructor derived from AudioWorkletProcessor interface under a specified name.")

Firefox76+SafariNoneChrome66+

---

Opera53+Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for AndroidNoneiOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera Mobile47+

`registerProcessor(name, processorCtor)`

Registers a class constructor derived from `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

When the `[registerProcessor(name, processorCtor)](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-registerprocessor)` method is called, perform the following steps. If an exception is thrown in any step, abort the remaining steps.

1.  If name is an empty string, throw a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)`.
2.  If name alredy exists as a key in the [node name to processor constructor map](https://www.w3.org/TR/webaudio/#node-name-to-processor-constructor-map), throw a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)`.
3.  If the result of `[IsConstructor](https://tc39.es/ecma262/#sec-isconstructor)(argument=processorCtor)` is `false`, throw a `[TypeError](https://heycam.github.io/webidl/#exceptiondef-typeerror)` .
4.  Let `_prototype_` be the result of `[Get](https://tc39.es/ecma262/#sec-get-o-p)(O=_processorCtor_, P="prototype")`.
5.  If the result of `[Type](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)(argument=_prototype_)` is not `Object`, throw a `[TypeError](https://heycam.github.io/webidl/#exceptiondef-typeerror)` .
6.  Let parameterDescriptorsValue be the result of `[Get](https://tc39.es/ecma262/#sec-get-o-p)(O=_processorCtor_, P="parameterDescriptors")`.
7.  If parameterDescriptorsValue is not `[undefined](https://heycam.github.io/webidl/#idl-undefined)`, execute the following steps:

    1.  Let parameterDescriptorSequence be the result of [the conversion](https://heycam.github.io/webidl/#es-to-sequence) from parameterDescriptorsValue to an IDL value of type `sequence<AudioParamDescriptor>`.
    2.  Let paramNames be an empty Array.
    3.  For each descriptor of parameterDescriptorSequence:
        1.  Let paramName be the value of the member `[name](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-name)` in descriptor. Throw a `[NotSupportedError](https://heycam.github.io/webidl/#notsupportederror)` if paramNames already contains paramName value.
        2.  Append paramName to the paramNames array.
        3.  Let defaultValue be the value of the member `[defaultValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-defaultvalue)` in descriptor.
        4.  Let minValue be the value of the member `[minValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-minvalue)` in descriptor.
        5.  Let maxValue be the value of the member `[maxValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-maxvalue)` in descriptor.
        6.  If the expresstion minValue <= defaultValue <= maxValue is false, throw an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)`.

8.  Append the key-value pair name → processorCtor to [node name to processor constructor map](https://www.w3.org/TR/webaudio/#node-name-to-processor-constructor-map) of the associated `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`.
9.  [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to append the key-value pair name → parameterDescriptorSequence to the [node name to parameter descriptor map](https://www.w3.org/TR/webaudio/#node-name-to-parameter-descriptor-map) of the associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

Note: The class constructor should only be looked up once, thus it does not have the opportunity to dynamically change after registration.

##### 1.32.2.3. The instantiation of `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`[](https://www.w3.org/TR/webaudio/#AudioWorkletProcessor-instantiation)

At the end of the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` construction, A [struct](https://infra.spec.whatwg.org/#struct) named processor construction data will be prepared for cross-thread transfer. This [struct](https://infra.spec.whatwg.org/#struct) contains the following [items](https://infra.spec.whatwg.org/#struct-item):

- name which is a `[DOMString](https://heycam.github.io/webidl/#idl-DOMString)` that is to be looked up in the [node name to processor constructor map](https://www.w3.org/TR/webaudio/#node-name-to-processor-constructor-map).
- node which is a reference to the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` created.
- options which is a serialized `[AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions)` given to the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`'s `[constructor](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-audioworkletnode)`.
- port which is a serialized `[MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport)` paired with the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`'s `[port](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-port)`.

Upon the arrival of the transferred data on the `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`, the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread) will invoke the algorithm below:

#### 1.32.3. The `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` Interface[](https://www.w3.org/TR/webaudio/#AudioWorkletNode)

This interface represents a user-defined `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` which lives on the [control thread](https://www.w3.org/TR/webaudio/#control-thread). The user can create an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` from a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`, and such a node can be connected with other built-in `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s to form an audio graph.

Every `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` has an associated active source flag, initially `true`. This flag causes the node to be retained in memory and perform audio processing in the absence of any connected inputs.

All tasks posted from an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` are posted to the task queue of its associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window\]
interface `AudioParamMap` {
readonly maplike<[DOMString](https://heycam.github.io/webidl/#idl-DOMString), [AudioParam](https://www.w3.org/TR/webaudio/#audioparam)\>;
};

This interface has "entries", "forEach", "get", "has", "keys", "values", @@iterator methods and a "size" getter brought by `readonly maplike`.

[AudioWorkletNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode "The AudioWorkletNode interface of the Web Audio API represents a base class for a user-defined AudioNode, which can be connected to an audio routing graph along with other nodes. It has an associated AudioWorkletProcessor, which does the actual audio processing in a Web Audio rendering thread.")

Firefox76+SafariNoneChrome66+

---

OperaYesEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera MobileYes

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=Window, [SecureContext](https://heycam.github.io/webidl/#SecureContext)\]
interface `AudioWorkletNode` : [AudioNode](https://www.w3.org/TR/webaudio/#audionode) {
[constructor](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-audioworkletnode) ([BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext) `context`[](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-audioworkletnode-context-name-options-context), [DOMString](https://heycam.github.io/webidl/#idl-DOMString) `name`[](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-audioworkletnode-context-name-options-name),
optional [AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions) `options`[](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-audioworkletnode-context-name-options-options) = {});
readonly attribute [AudioParamMap](https://www.w3.org/TR/webaudio/#audioparammap) [parameters](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-parameters);
readonly attribute [MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport) [port](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-port);
attribute [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler) [onprocessorerror](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-onprocessorerror);
};

##### 1.32.3.1. Constructors[](https://www.w3.org/TR/webaudio/#AudioWorkletNode-constructors)

[AudioWorkletNode/AudioWorkletNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/AudioWorkletNode "The AudioWorkletNode() constructor creates a new AudioWorkletNode object, which represents an AudioNode that uses a JavaScript function to perform custom audio processing.")

Firefox76+SafariNoneChrome66+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android66+Android WebView66+Samsung Internet9.0+Opera Mobile?

`AudioWorkletNode(context, name, options)`

When the constructor is called, the user agent MUST perform the following steps on the control thread:

When the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-audioworkletnode)` constructor is invoked with context, nodeName, options:

1.  If nodeName does not exist as a key in the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`’s [node name to parameter descriptor map](https://www.w3.org/TR/webaudio/#node-name-to-parameter-descriptor-map), throw a `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` exception and abort these steps.
2.  Let node be [this](https://heycam.github.io/webidl/#this) value.
3.  [Initialize the AudioNode](https://www.w3.org/TR/webaudio/#audionode-constructor-init) node with context and options as arguments.
4.  [Configure input, output and output channels](https://www.w3.org/TR/webaudio/#configure-with-audioworkletnodeoptions) of node with options. Abort the remaining steps if any exception is thrown.
5.  Let messageChannel be a new `[MessageChannel](https://html.spec.whatwg.org/multipage/web-messaging.html#messagechannel)`.
6.  Let nodePort be the value of messageChannel’s `[port1](https://html.spec.whatwg.org/multipage/web-messaging.html#dom-messagechannel-port1)` attribute.
7.  Let processorPortOnThisSide be the value of messageChannel’s `[port2](https://html.spec.whatwg.org/multipage/web-messaging.html#dom-messagechannel-port2)` attribute.
8.  Let serializedProcessorPort be the result of [StructuredSerializeWithTransfer](https://html.spec.whatwg.org/multipage/structured-data.html#structuredserializewithtransfer)(processorPortOnThisSide, « processorPortOnThisSide »).
9.  [Convert](https://heycam.github.io/webidl/#dictionary-to-es) options dictionary to optionsObject.
10. Let serializedOptions be the result of [StructuredSerialize](https://html.spec.whatwg.org/multipage/structured-data.html#structuredserialize)(optionsObject).

11. Set node’s `[port](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-port)` to nodePort.

12. Let parameterDescriptors be the result of retrieval of nodeName from [node name to parameter descriptor map](https://www.w3.org/TR/webaudio/#node-name-to-parameter-descriptor-map):

13. Let audioParamMap be a new `[AudioParamMap](https://www.w3.org/TR/webaudio/#audioparammap)` object.
14. For each descriptor of parameterDescriptors:

    1.  Let paramName be the value of `[name](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-name)` member in descriptor.
    2.  Let audioParam be a new `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` instance with `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-automationrate)`, `[defaultValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-defaultvalue)`, `[minValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-minvalue)`, and `[maxValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-maxvalue)` having values equal to the values of corresponding members on descriptor.
    3.  Append a key-value pair paramName → audioParam to audioParamMap’s entries.

15. If `[parameterData](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-parameterdata)` is present on options, perform the following steps:

    1.  Let parameterData be the value of `[parameterData](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-parameterdata)`.
    2.  For each paramName → paramValue of parameterData:

        1.  If there exists a map entry on audioParamMap with key paramName, let audioParamInMap be such entry.
        2.  Set `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` property of audioParamInMap to paramValue.

16. Set node’s `[parameters](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-parameters)` to audioParamMap.
17. [Queue a control message](https://www.w3.org/TR/webaudio/#queuing) to [invoke](https://www.w3.org/TR/webaudio/#invoking-processor-constructor) the `[constructor](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-audioworkletprocessor)` of the corresponding `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` with the [processor construction data](https://www.w3.org/TR/webaudio/#processor-construction-data) that consists of: nodeName, node, serializedOptions, and serializedProcessorPort.

##### 1.32.3.2. Attributes[](https://www.w3.org/TR/webaudio/#AudioWorkletNode-attributes)

[AudioWorkletNode/onprocessorerror](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/onprocessorerror "The onprocessorerror property of the AudioWorkletNode interface defines an event handler function to be called when the processorerror event fires. This occurs when the underlying AudioWorkletProcessor behind the node throws an exception in its constructor, the process method, or any user-defined class method.")

Firefox76+SafariNoneChrome67+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android67+Android WebView67+Samsung Internet9.0+Opera Mobile?

`onprocessorerror`, of type [EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)

When an unhandled exception is thrown from the processor’s `constructor`, `process` method, or any user-defined class method, the processor will [queue a media element task](https://html.spec.whatwg.org/multipage/media.html#queue-a-media-element-task) to [fire an event](https://dom.spec.whatwg.org/#concept-event-fire) named `processorerror` using [ErrorEvent](https://html.spec.whatwg.org/multipage/webappapis.html#the-errorevent-interface) at the associated `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

The `ErrorEvent` is created and initialized appropriately with its `message`, `filename`, `lineno`, `colno` attributes on the control thread.

Note that once a unhandled exception is thrown, the processor will output silence throughout its lifetime.

[AudioWorkletNode/parameters](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/parameters "The read-only parameters property of the AudioWorkletNode interface returns the associated AudioParamMap — that is, a Map-like collection of AudioParam objects. They are instantiated during creation of the underlying AudioWorkletProcessor according to its parameterDescriptors static getter.")

Firefox76+SafariNoneChrome67+

---

OperaYesEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android67+Android WebView67+Samsung Internet9.0+Opera MobileYes

`parameters`, of type [AudioParamMap](https://www.w3.org/TR/webaudio/#audioparammap), readonly

The `parameters` attribute is a collection of `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` objects with associated names. This maplike object is populated from a list of `[AudioParamDescriptor](https://www.w3.org/TR/webaudio/#dictdef-audioparamdescriptor)`s in the `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` class constructor at the instantiation.

[AudioWorkletNode/port](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNode/port "The read-only port property of the AudioWorkletNode interface returns the associated MessagePort. It can be used to communicate between the node and its associated AudioWorkletProcessor.")

Firefox76+SafariNoneChrome67+

---

OperaYesEdge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android67+Android WebView67+Samsung Internet9.0+Opera MobileYes

`port`, of type [MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport), readonly

Every `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` has an associated `port` which is the `[MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport)`. It is connected to the port on the corresponding `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` object allowing bidirectional communication between the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` and its `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

Note: Authors that register a event listener on the `"message"` event of this `[port](https://www.w3.org/TR/webaudio/#dom-audioworkletnode-port)` should call `[close](https://html.spec.whatwg.org/multipage/web-messaging.html#dom-messageport-close)` on either end of the `[MessageChannel](https://html.spec.whatwg.org/multipage/web-messaging.html#messagechannel)` (either in the `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` or the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` side) to allow for resources to be [collected](https://html.spec.whatwg.org/multipage/web-messaging.html#ports-and-garbage-collection).

##### 1.32.3.3. `[AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions)`[](https://www.w3.org/TR/webaudio/#AudioWorkletNodeOptions)

The `[AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions)` dictionary can be used to initialize attibutes in the instance of an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

dictionary `AudioWorkletNodeOptions` : [AudioNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audionodeoptions) {
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfInputs](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-numberofinputs) = 1;
[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long) [numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-numberofoutputs) = 1;
[sequence](https://heycam.github.io/webidl/#idl-sequence)<[unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long)\> [outputChannelCount](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-outputchannelcount);
[record](https://heycam.github.io/webidl/#idl-record)<[DOMString](https://heycam.github.io/webidl/#idl-DOMString), [double](https://heycam.github.io/webidl/#idl-double)\> [parameterData](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-parameterdata);
[object](https://heycam.github.io/webidl/#idl-object) [processorOptions](https://www.w3.org/TR/webaudio/#dom-audioworkletnodeoptions-processoroptions);
};

###### 1.32.3.3.1. Dictionary `[AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audioworkletnodeoptions-members)

`numberOfInputs`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `1`

This is used to initialize the value of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` `[numberOfInputs](https://www.w3.org/TR/webaudio/#dom-audionode-numberofinputs)` attribute.

`numberOfOutputs`, of type [unsigned long](https://heycam.github.io/webidl/#idl-unsigned-long), defaulting to `1`

This is used to initialize the value of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` `[numberOfOutputs](https://www.w3.org/TR/webaudio/#dom-audionode-numberofoutputs)` attribute.

`outputChannelCount`, of type `sequence<unsigned long>`

This array is used to configure the number of channels in each output.

`parameterData`, of type record<[DOMString](https://heycam.github.io/webidl/#idl-DOMString), [double](https://heycam.github.io/webidl/#idl-double)\>

This is a list of user-defined key-value pairs that are used to set the initial `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` of an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` with the matched name in the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

`processorOptions`, of type [object](https://heycam.github.io/webidl/#idl-object)

This holds any user-defined data that may be used to initialize custom properties in an `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` instance that is associated with the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

###### 1.32.3.3.2. Configuring Channels with `[AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions)`[](https://www.w3.org/TR/webaudio/#configuring-channels-with-audioworkletnodeoptions)

The following algorithm describes how an `[AudioWorkletNodeOptions](https://www.w3.org/TR/webaudio/#dictdef-audioworkletnodeoptions)` can be used to configure various channel configurations.

#### 1.32.4. The `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` Interface[](https://www.w3.org/TR/webaudio/#AudioWorkletProcessor)

This interface represents an audio processing code that runs on the audio [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread). It lives in the `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`, and the definition of the class manifests the actual audio processing. Note that the an `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` construction can only happen as a result of an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` contruction.

[AudioWorkletProcessor](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor "The AudioWorkletProcessor interface of the Web Audio API represents an audio processing code behind a custom AudioWorkletNode. It lives in the AudioWorkletGlobalScope and runs on the Web Audio rendering thread. In turn, an AudioWorkletNode based on it runs on the main thread.")

Firefox76+SafariNoneChrome64+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android64+Android WebView64+Samsung Internet9.0+Opera Mobile?

\[[Exposed](https://heycam.github.io/webidl/#Exposed)\=AudioWorklet\]
interface `AudioWorkletProcessor` {
[constructor](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-audioworkletprocessor) ();
readonly attribute [MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport) [port](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-port);
};

callback [AudioWorkletProcessCallback](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters) =
[boolean](https://heycam.github.io/webidl/#idl-boolean) ([FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)<[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)<[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)\>> `inputs`,
[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)<[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)<[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)\>> `outputs`,
[object](https://heycam.github.io/webidl/#idl-object) `parameters`);

`[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` has two internal slots:

`[[node reference]]`

A reference to the associated `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

`[[callable process]]`

A boolean flag representing whether [process()](https://www.w3.org/TR/webaudio/#process) is a valid function that can be invoked.

##### 1.32.4.1. Constructors[](https://www.w3.org/TR/webaudio/#AudioWorketProcessor-constructors)

[AudioWorkletProcessor/AudioWorkletProcessor](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/AudioWorkletProcessor "The AudioWorkletProcessor() constructor creates a new AudioWorkletProcessor object, which represents an underlying audio processing mechanism of an AudioWorkletNode.")

Firefox76+SafariNoneChrome64+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android64+Android WebView64+Samsung Internet9.0+Opera Mobile?

`AudioWorkletProcessor()`

When the constructor for `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` is invoked, the following steps are performed on the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread).

##### 1.32.4.2. Attributes[](https://www.w3.org/TR/webaudio/#AudioWorkletProcessor-attributes)

[AudioWorkletProcessor/port](https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/port "The read-only port property of the AudioWorkletProcessor interface returns the associated MessagePort. It can be used to communicate between the processor and the AudioWorkletNode to which it belongs.")

Firefox76+SafariNoneChrome64+

---

Opera?Edge79+

---

Edge (Legacy)NoneIENone

---

Firefox for Android79+iOS SafariNoneChrome for Android64+Android WebView64+Samsung Internet9.0+Opera Mobile?

`port`, of type [MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport), readonly

Every `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` has an associated `port` which is a `[MessagePort](https://html.spec.whatwg.org/multipage/web-messaging.html#messageport)`. It is connected to the port on the corresponding `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` object allowing bidirectional communication between an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` and its `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

Note: Authors that register a event listener on the `"message"` event of this `[port](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-port)` should call `[close](https://html.spec.whatwg.org/multipage/web-messaging.html#dom-messageport-close)` on either end of the `[MessageChannel](https://html.spec.whatwg.org/multipage/web-messaging.html#messagechannel)` (either in the `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` or the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` side) to allow for resources to be [collected](https://html.spec.whatwg.org/multipage/web-messaging.html#ports-and-garbage-collection).

##### 1.32.4.3. Callback `[AudioWorkletProcessCallback](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters)`[](https://www.w3.org/TR/webaudio/#callback-audioworketprocess-callback)

Users can define a custom audio processor by extending `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`. The subclass MUST define an `[AudioWorkletProcessCallback](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters)` named `process()` that implements the audio processing algorithm and may have a static property named `parameterDescriptors` which is an iterable of `[AudioParamDescriptor](https://www.w3.org/TR/webaudio/#dictdef-audioparamdescriptor)`s.

The [process()](https://www.w3.org/TR/webaudio/#process) callback function is handled as specified when [rendering a graph](https://www.w3.org/TR/webaudio/#rendering-a-graph).

The return value of this callback controls the lifetime of the `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`'s associated `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

This lifetime policy can support a variety of approaches found in built-in nodes, including the following:

- Nodes that transform their inputs, and are active only while connected inputs and/or script references exist. Such nodes SHOULD return `false` from [process()](https://www.w3.org/TR/webaudio/#process) which allows the presence or absence of connected inputs to determine whether the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` is [actively processing](https://www.w3.org/TR/webaudio/#actively-processing).
- Nodes that transform their inputs, but which remain active for a [tail-time](https://www.w3.org/TR/webaudio/#tail-time) after their inputs are disconnected. In this case, [process()](https://www.w3.org/TR/webaudio/#process) SHOULD return `true` for some period of time after `inputs` is found to contain zero channels. The current time may be obtained from the global scope’s `[currentTime](https://www.w3.org/TR/webaudio/#dom-audioworkletglobalscope-currenttime)` to measure the start and end of this tail-time interval, or the interval could be calculated dynamically depending on the processor’s internal state.
- Nodes that act as sources of output, typically with a lifetime. Such nodes SHOULD return `true` from [process()](https://www.w3.org/TR/webaudio/#process) until the point at which they are no longer producing an output.

Note that the preceding definition implies that when no return value is provided from an implementation of [process()](https://www.w3.org/TR/webaudio/#process), the effect is identical to returning `false` (since the effective return value is the falsy value `[undefined](https://heycam.github.io/webidl/#idl-undefined)`). This is a reasonable behavior for any `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` that is active only when it has active inputs.

The example below shows how `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` can be defined and used in an `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

[](https://www.w3.org/TR/webaudio/#example-1d246ea2)class MyProcessor extends AudioWorkletProcessor {
static get parameterDescriptors() {
return \[{
name: 'myParam',
defaultValue: 0.5,
minValue: 0,
maxValue: 1,
automationRate: "k-rate"
}\];
}

process(inputs, outputs, parameters) {
// Get the first input and output.
const input \= inputs\[0\];
const output \= outputs\[0\];
const myParam \= parameters.myParam;

    // A simple amplifier for single input and output. Note that the
    // automationRate is "k-rate", so it will have a single value at index \[0\]
    // for each render quantum.
    for (let channel \= 0; channel < output.length; ++channel) {
      for (let i \= 0; i < output\[channel\].length; ++i) {
        output\[channel\]\[i\] \= input\[channel\]\[i\] \* myParam\[0\];
      }
    }

}
}

###### 1.32.4.3.1. Callback `[AudioWorkletProcessCallback](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters)` Parameters[](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters)

The following describes the parameters to the `[AudioWorkletProcessCallback](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters)` function.

In general, the `[inputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-inputs)` and `[outputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-outputs)` arrays will be reused between calls so that no memory allocation is done. However, if the topology changes, because, say, the number of channels in the input or the output changes, new arrays are reallocated. New arrays are also reallocated if any part of the `[inputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-inputs)` or `[outputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-outputs)` arrays are transferred.

`[inputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-inputs)`, of type `` `[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)`<`[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)`<`[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`>>``

The input audio buffer from the incoming connections provided by the user agent. `inputs[n][m]` is a `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` of audio samples for the mth channel of the nth input. While the number of inputs is fixed at construction, the number of channels can be changed dynamically based on [computedNumberOfChannels](https://www.w3.org/TR/webaudio/#computednumberofchannels).

If there are no [actively processing](https://www.w3.org/TR/webaudio/#actively-processing) `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s connected to the nth input of the `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` for the current render quantum, then the content of `inputs[n]` is an empty array, indicating that zero channels of input are available. This is the only circumstance under which the number of elements of `inputs[n]` can be zero.

`[outputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-outputs)`, of type `` `[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)`<`[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)`<`[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`>>``

The output audio buffer that is to be consumed by the user agent. `outputs[n][m]` is a `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` object containing the audio samples for mth channel of nth output. Each of the `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`s are zero-filled. The number of channels in the output will match [computedNumberOfChannels](https://www.w3.org/TR/webaudio/#computednumberofchannels) only when the node has a single output.

`[parameters](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-parameters)`, of type `[object](https://heycam.github.io/webidl/#idl-object)`

An [ordered map](https://infra.spec.whatwg.org/#ordered-map) of name → parameterValues. `parameters["name"]` returns parameterValues, which is a `[FrozenArray](https://heycam.github.io/webidl/#idl-frozen-array)`<`[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`\> with the automation values of the name `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`.

For each array, the array contains the [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) of the parameter for all frames in the [render quantum](https://www.w3.org/TR/webaudio/#render-quantum). However, if no automation is scheduled during this render quantum, the array MAY have length 1 with the array element being the constant value of the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` for the [render quantum](https://www.w3.org/TR/webaudio/#render-quantum).

This object is frozen according the the following steps

This frozen [ordered map](https://infra.spec.whatwg.org/#ordered-map) computed in the algorithm is passed to the `[parameters](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-parameters)` argument.

Note: This means the object cannot be modified and hence the same object can be used for successive calls unless length of an array changes.

##### 1.32.4.4. `[AudioParamDescriptor](https://www.w3.org/TR/webaudio/#dictdef-audioparamdescriptor)`[](https://www.w3.org/TR/webaudio/#AudioParamDescriptor)

The `[AudioParamDescriptor](https://www.w3.org/TR/webaudio/#dictdef-audioparamdescriptor)` dictionary is used to specify properties for an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` object that is used in an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

dictionary `AudioParamDescriptor` {
required [DOMString](https://heycam.github.io/webidl/#idl-DOMString) [name](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-name);
[float](https://heycam.github.io/webidl/#idl-float) [defaultValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-defaultvalue) = 0;
[float](https://heycam.github.io/webidl/#idl-float) [minValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-minvalue) = -3.4028235e38;
[float](https://heycam.github.io/webidl/#idl-float) [maxValue](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-maxvalue) = 3.4028235e38;
[AutomationRate](https://www.w3.org/TR/webaudio/#enumdef-automationrate) [automationRate](https://www.w3.org/TR/webaudio/#dom-audioparamdescriptor-automationrate) = "a-rate";
};

###### 1.32.4.4.1. Dictionary `[AudioParamDescriptor](https://www.w3.org/TR/webaudio/#dictdef-audioparamdescriptor)` Members[](https://www.w3.org/TR/webaudio/#dictionary-audioparamdescriptor-members)

There are constraints on the values for these members. See the [algorithm for handling an AudioParamDescriptor](https://www.w3.org/TR/webaudio/#steps-parameterDescriptorSequence) for the constraints.

`automationRate`, of type [AutomationRate](https://www.w3.org/TR/webaudio/#enumdef-automationrate), defaulting to `"a-rate"`

Represents the default automation rate.

`defaultValue`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `0`

Represents the default value of the parameter.

`maxValue`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `3.4028235e38`

Represents the maximum value.

`minValue`, of type [float](https://heycam.github.io/webidl/#idl-float), defaulting to `-3.4028235e38`

Represents the minimum value.

`name`, of type [DOMString](https://heycam.github.io/webidl/#idl-DOMString)

Represents the name of the parameter.

#### 1.32.5. AudioWorklet Sequence of Events[](https://www.w3.org/TR/webaudio/#AudioWorklet-Sequence)

The following figure illustrates an idealized sequence of events occurring relative to an `[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)`:

![](https://www.w3.org/TR/webaudio/images/audioworklet-instantiation-sequence.png)

`[AudioWorklet](https://www.w3.org/TR/webaudio/#audioworklet)` sequence

The steps depicted in the diagram are one possible sequence of events involving the creation of an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` and an associated `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`, followed by the creation of an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` and its associated `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

1.  An `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is created.
2.  In the main scope, `context.audioWorklet` is requested to add a script module.
3.  Since none exists yet, a new `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)` is created in association with the context. This is the global scope in which `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` class definitions will be evaluated. (On subsequent calls, this previously created scope will be used.)
4.  The imported script is run in the newly created global scope.
5.  As part of running the imported script, an `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` is registered under a key (`"custom"` in the above diagram) within the `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`. This populates maps both in the global scope and in the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.
6.  The promise for the `[addModule()](https://html.spec.whatwg.org/multipage/worklets.html#dom-worklet-addmodule)` call is resolved.
7.  In the main scope, an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` is created using the user-specified key along with a dictionary of options.
8.  As part of the node’s creation, this key is used to look up the correct `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` subclass for instantiation.
9.  An instance of the `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` subclass is instantiated with a structured clone of the same options dictionary. This instance is paired with the previously created `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

#### 1.32.6. AudioWorklet Examples[](https://www.w3.org/TR/webaudio/#AudioWorklet-Examples)

##### 1.32.6.1. The BitCrusher Node[](https://www.w3.org/TR/webaudio/#the-bitcrusher-node)

Bitcrushing is a mechanism by which the quality of an audio stream is reduced both by quantizing the sample value (simulating a lower bit-depth), and by quantizing in time resolution (simulating a lower sample rate). This example shows how to use `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s (in this case, treated as [a-rate](https://www.w3.org/TR/webaudio/#a-rate)) inside an `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

[](https://www.w3.org/TR/webaudio/#example-06f3f4b7)const context \= new AudioContext();context.audioWorklet.addModule('bitcrusher.js').then(() \=> { const osc \= new OscillatorNode(context); const amp \= new GainNode(context); // Create a worklet node. 'BitCrusher' identifies the // AudioWorkletProcessor previously registered when // bitcrusher.js was imported. The options automatically // initialize the correspondingly named AudioParams. const bitcrusher \= new AudioWorkletNode(context, 'bitcrusher', { parameterData: {bitDepth: 8} }); osc.connect(bitcrusher).connect(amp).connect(context.destination); osc.start();});

[](https://www.w3.org/TR/webaudio/#example-18f7f42a)class Bitcrusher extends AudioWorkletProcessor { static get parameterDescriptors () { return \[{ name: 'bitDepth', defaultValue: 12, minValue: 1, maxValue: 16 }, { name: 'frequencyReduction', defaultValue: 0.5, minValue: 0, maxValue: 1 }\]; } constructor (options) { // The initial parameter value can be set by passing |options| // to the processor’s constructor. super(options); this.\_phase \= 0; this.\_lastSampleValue \= 0; } process (inputs, outputs, parameters) { const input \= inputs\[0\]; const output \= outputs\[0\]; const bitDepth \= parameters.bitDepth; const frequencyReduction \= parameters.frequencyReduction; if (bitDepth.length \> 1) { // The bitDepth parameter array has 128 sample values. for (let channel \= 0; channel < output.length; ++channel) { for (let i \= 0; i < output\[channel\].length; ++i) { let step \= Math.pow(0.5, bitDepth\[i\]); // Use modulo for indexing to handle the case where // the length of the frequencyReduction array is 1. this.\_phase += frequencyReduction\[i % frequencyReduction.length\]; if (this.\_phase \>= 1.0) { this.\_phase \-= 1.0; this.\_lastSampleValue \= step \* Math.floor(input\[channel\]\[i\] / step + 0.5); } output\[channel\]\[i\] \= this.\_lastSampleValue; } } } else { // Because we know bitDepth is constant for this call, // we can lift the computation of step outside the loop, // saving many operations. const step \= Math.pow(0.5, bitDepth\[0\]); for (let channel \= 0; channel < output.length; ++channel) { for (let i \= 0; i < output\[channel\].length; ++i) { this.\_phase += frequencyReduction\[i % frequencyReduction.length\]; if (this.\_phase \>= 1.0) { this.\_phase \-= 1.0; this.\_lastSampleValue \= step \* Math.floor(input\[channel\]\[i\] / step + 0.5); } output\[channel\]\[i\] \= this.\_lastSampleValue; } } } // No need to return a value; this node’s lifetime is dependent only on its // input connections. }});registerProcessor('bitcrusher', Bitcrusher);

Note: In the definition of `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` class, an `[InvalidStateError](https://heycam.github.io/webidl/#invalidstateerror)` will be thrown if the author-supplied constructor has an explicit return value that is not `this` or does not properly call `super()`.

##### 1.32.6.2. VU Meter Node[](https://www.w3.org/TR/webaudio/#vu-meter-mode)

This example of a simple sound level meter further illustrates how to create an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` subclass that acts like a native `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, accepting constructor options and encapsulating the inter-thread communication (asynchronous) between `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` and `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`. This node does not use any output.

[](https://www.w3.org/TR/webaudio/#example-b29112dd)/\* vumeter-node.js: Main global scope \*/export default class VUMeterNode extends AudioWorkletNode { constructor (context, updateIntervalInMS) { super(context, 'vumeter', { numberOfInputs: 1, numberOfOutputs: 0, channelCount: 1, processorOptions: { updateIntervalInMS: updateIntervalInMS || 16.67; } }); // States in AudioWorkletNode this.\_updateIntervalInMS \= updateIntervalInMS; this.\_volume \= 0; // Handles updated values from AudioWorkletProcessor this.port.onmessage \= event \=> { if (event.data.volume) this.\_volume \= event.data.volume; } this.port.start(); } get updateInterval() { return this.\_updateIntervalInMS; } set updateInterval(updateIntervalInMS) { this.\_updateIntervalInMS \= updateIntervalInMS; this.port.postMessage({updateIntervalInMS: updateIntervalInMS}); } draw () { // Draws the VU meter based on the volume value // every |this.\_updateIntervalInMS| milliseconds. }};

[](https://www.w3.org/TR/webaudio/#example-55c4a817)/\* vumeter-processor.js: AudioWorkletGlobalScope \*/const SMOOTHING_FACTOR \= 0.9;const MINIMUM_VALUE \= 0.00001;registerProcessor('vumeter', class extends AudioWorkletProcessor { constructor (options) { super(); this.\_volume \= 0; this.\_updateIntervalInMS \= options.processorOptions.updateIntervalInMS; this.\_nextUpdateFrame \= this.\_updateIntervalInMS; this.port.onmessage \= event \=> { if (event.data.updateIntervalInMS) this.\_updateIntervalInMS \= event.data.updateIntervalInMS; } } get intervalInFrames () { return this.\_updateIntervalInMS / 1000 \* sampleRate; } process (inputs, outputs, parameters) { const input \= inputs\[0\]; // Note that the input will be down-mixed to mono; however, if no inputs are // connected then zero channels will be passed in. if (input.length \> 0) { const samples \= input\[0\]; let sum \= 0; let rms \= 0; // Calculated the squared-sum. for (let i \= 0; i < samples.length; ++i) sum += samples\[i\] \* samples\[i\]; // Calculate the RMS level and update the volume. rms \= Math.sqrt(sum / samples.length); this.\_volume \= Math.max(rms, this.\_volume \* SMOOTHING_FACTOR); // Update and sync the volume property with the main thread. this.\_nextUpdateFrame \-= samples.length; if (this.\_nextUpdateFrame < 0) { this.\_nextUpdateFrame += this.intervalInFrames; this.port.postMessage({volume: this.\_volume}); } } // Keep on processing if the volume is above a threshold, so that // disconnecting inputs does not immediately cause the meter to stop // computing its smoothed value. return this.\_volume \>= MINIMUM_VALUE; }});

[](https://www.w3.org/TR/webaudio/#example-2d1abf00)/\* index.js: Main global scope, entry point \*/import VUMeterNode from './vumeter-node.js';const context \= new AudioContext();context.audioWorklet.addModule('vumeter-processor.js').then(() \=> { const oscillator \= new OscillatorNode(context); const vuMeterNode \= new VUMeterNode(context, 25); oscillator.connect(vuMeterNode); oscillator.start(); function drawMeter () { vuMeterNode.draw(); requestAnimationFrame(drawMeter); } drawMeter();});

## 2\. Processing model[](https://www.w3.org/TR/webaudio/#processing-model)

### 2.1. Background[](https://www.w3.org/TR/webaudio/#processing-model-background)

_This section is non-normative._

Real-time audio systems that require low latency are often implemented using _callback functions_, where the operating system calls the program back when more audio has to be computed in order for the playback to stay uninterrupted. Such a callback is ideally called on a high priority thread (often the highest priority on the system). This means that a program that deals with audio only executes code from this callback. Crossing thread boundaries or adding some buffering between a rendering thread and the callback would naturally add latency or make the system less resilient to glitches.

For this reason, the traditional way of executing asynchronous operations on the Web Platform, the event loop, does not work here, as the thread is not _continuously executing_. Additionally, a lot of unnecessary and potentially blocking operations are available from traditional execution contexts (Windows and Workers), which is not something that is desirable to reach an acceptable level of performance.

Additionally, the Worker model makes creating a dedicated thread necessary for a script execution context, while all `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s usually share the same execution context.

Note: This section specifies how the end result should look like, not how it should be implemented. In particular, instead of using message queue, implementors can use memory that is shared between threads, as long as the memory operations are not reordered.

### 2.2. Control Thread and Rendering Thread[](https://www.w3.org/TR/webaudio/#control-thread-and-rendering-thread)

The Web Audio API MUST be implemented using a [control thread](https://www.w3.org/TR/webaudio/#control-thread), and a [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread).

The control thread is the thread from which the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is instantiated, and from which authors manipulate the audio graph, that is, from where the operation on a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` are invoked. The rendering thread is the thread on which the actual audio output is computed, in reaction to the calls from the [control thread](https://www.w3.org/TR/webaudio/#control-thread). It can be a real-time, callback-based audio thread, if computing audio for an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`, or a normal thread if computing audio for an `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

The [control thread](https://www.w3.org/TR/webaudio/#control-thread) uses a traditional event loop, as described in [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html).

The [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread) uses a specialized rendering loop, described in the section [Rendering an audio graph](https://www.w3.org/TR/webaudio/#rendering-loop)

Communication from the [control thread](https://www.w3.org/TR/webaudio/#control-thread) to the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread) is done using [control message](https://www.w3.org/TR/webaudio/#control-message) passing. Communication in the other direction is done using regular event loop tasks.

Each `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` has a single control message queue that is a list of control messages that are operations running on the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread).

Queuing a control message means adding the message to the end of the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue) of an `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

Note: For example, successfuly calling `start()` on an `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)` `source` adds a [control message](https://www.w3.org/TR/webaudio/#control-message) to the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue) of the associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

[Control messages](https://www.w3.org/TR/webaudio/#control-message) in a [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue) are ordered by time of insertion. The oldest message is therefore the one at the front of the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue).

### 2.3. Asynchronous Operations[](https://www.w3.org/TR/webaudio/#asynchronous-operations)

Calling methods on `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s is effectively asynchronous, and MUST to be done in two phases: a synchronous part and an asynchronous part. For each method, some part of the execution happens on the [control thread](https://www.w3.org/TR/webaudio/#control-thread) (for example, throwing an exception in case of invalid parameters), and some part happens on the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread) (for example, changing the value of an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`).

In the description of each operation on `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s and `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`s, the synchronous section is marked with a ⌛. All the other operations are executed [in parallel](https://html.spec.whatwg.org/multipage/infrastructure.html#in-parallel), as described in [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html).

The synchronous section is executed on the [control thread](https://www.w3.org/TR/webaudio/#control-thread), and happens immediately. If it fails, the method execution is aborted, possibly throwing an exception. If it succeeds, a [control message](https://www.w3.org/TR/webaudio/#control-message), encoding the operation to be executed on the [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread) is enqueued on the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue) of this [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread).

The synchronous and asynchronous sections order with respect to other events MUST be the same: given two operation A and B with respective synchronous and asynchronous section ASync and AAsync, and BSync and BAsync, if A happens before B, then ASync happens before BSync, and AAsync happens before BAsync. In other words, synchronous and asynchronous sections can’t be reordered.

### 2.4. Rendering an Audio Graph[](https://www.w3.org/TR/webaudio/#rendering-loop)

Rendering an audio graph is done in blocks of 128 samples-frames. A block of 128 samples-frames is called a render quantum, and the render quantum size is 128.

Operations that happen atomically on a given thread can only be executed when no other [atomic](https://www.w3.org/TR/webaudio/#atomically) operation is running on another thread.

The algorithm for rendering a block of audio from a `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` _G_ with a [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue) _Q_ is comprised of multiple steps and explained in further detail in the algorithm of [rendering a graph](https://www.w3.org/TR/webaudio/#rendering-a-graph).

In practice, the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` [rendering thread](https://www.w3.org/TR/webaudio/#rendering-thread) is often running off a system-level audio callback, that executes in an isochronous fashion.

An `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` is not required to have a system-level audio callback, but behaves as if it did with the callback happening as soon as the previous callback is finished.

The audio callback is also queued as a task in the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue). The UA MUST perform the following algorithms to process render quanta to fulfill such task by filling up the requested buffer size. Along with the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue), each `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` has a regular [task queue](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue), called its associated task queue for tasks that are posted to the rendering thread from the control thread. An additional microtask checkpoint is performed after processing a render quantum to run any microtasks that might have been queued during the execution of the `process` methods of `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)`.

All tasks posted from an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` are posted to the [associated task queue](https://www.w3.org/TR/webaudio/#baseaudiocontext-associated-task-queue) of its associated `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`.

The following step MUST be performed once before the rendering loop starts.

1.  Set the internal slot `[[current frame]]` of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` to 0. Also set `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` to 0.

The following steps MUST be performed when rendering a render quantum.

1.  Let render result be `false`.
2.  Process the [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue).

    1.  Let Qrendering be an empty [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue). [Atomically](https://www.w3.org/TR/webaudio/#atomically) [swap](https://www.w3.org/TR/webaudio/#swap) Qrendering with the current [control message queue](https://www.w3.org/TR/webaudio/#control-message-queue).
    2.  While there are messages in Qrendering, execute the following steps:

        1.  Execute the asynchronous section of the [oldest message](https://www.w3.org/TR/webaudio/#oldest-message) of Qrendering.
        2.  Remove the [oldest message](https://www.w3.org/TR/webaudio/#oldest-message) of Qrendering.

3.  Process the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s [associated task queue](https://www.w3.org/TR/webaudio/#baseaudiocontext-associated-task-queue).

    1.  Let task queue be the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`'s [associated task queue](https://www.w3.org/TR/webaudio/#baseaudiocontext-associated-task-queue).
    2.  Let task count be the number of tasks in the in task queue
    3.  While task count is not equal to 0, execute the following steps:

        1.  Let oldest task be the first runnable task in task queue, and remove it from task queue.
        2.  Set the rendering loop’s currently running task to oldest task.
        3.  Perform oldest task’s steps.
        4.  Set the rendering loop currently running task back to `null`.
        5.  Decrement task count
        6.  Perform a microtask checkpoint.

4.  Process a render quantum.

    1.  If the `[[[rendering thread state]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-rendering-thread-state-slot)` of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` is not `running`, return false.
    2.  Order the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s of the `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` to be processed.

        1.  Let ordered node list be an empty list of `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s and `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)`. It will contain an ordered list of `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s and the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` when this ordering algorithm terminates.
        2.  Let nodes be the set of all nodes created by this `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`, and still alive.
        3.  Add the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` to nodes.
        4.  Let cycle breakers be an empty set of `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`s. It will contain all the `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`s that are part of a cycle.
        5.  For each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` node in nodes:

            1.  If node is a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` that is part of a cycle, add it to cycle breakers and remove it from nodes.

        6.  For each `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` delay in cycle breakers:

            1.  Let delayWriter and delayReader respectively be a [DelayWriter](https://www.w3.org/TR/webaudio/#delaywriter) and a [DelayReader](https://www.w3.org/TR/webaudio/#delayreader), for delay. Add delayWriter and delayReader to nodes. Disconnect delay from all its input and outputs.

                Note: This breaks the cycle: if a `DelayNode` is in a cycle, its two ends can be considered separately, because delay lines cannot be smaller than one render quantum when in a cycle.

        7.  If nodes contains cycles, [mute](https://www.w3.org/TR/webaudio/#mute) all the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s that are part of this cycle, and remove them from nodes.
        8.  Consider all elements in nodes to be unmarked. While there are unmarked elements in nodes:

            1.  Choose an element node in nodes.
            2.  [Visit](https://www.w3.org/TR/webaudio/#visit) node.

            Visiting a node means performing the following steps:

            1.  If node is marked, abort these steps.
            2.  Mark node.
            3.  If node is an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, [Visit](https://www.w3.org/TR/webaudio/#visit) each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` connected to the input of node.
            4.  For each `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` param of node:

                1.  For each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` param input node connected to param:

                    1.  [Visit](https://www.w3.org/TR/webaudio/#visit) param input node

            5.  Add node to the beginning of ordered node list.

        9.  Reverse the order of ordered node list.

    3.  [Compute the value(s)](https://www.w3.org/TR/webaudio/#computation-of-value) of the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)`'s `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s for this block.
    4.  For each `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, in ordered node list:

        1.  For each `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, execute these steps:

            1.  If this `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` has any `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` connected to it, [sum](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) the buffers [made available for reading](https://www.w3.org/TR/webaudio/#available-for-reading) by all `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` connected to this `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`, [down mix](https://www.w3.org/TR/webaudio/#down-mix) the resulting buffer down to a mono channel, and call this buffer the input AudioParam buffer.
            2.  [Compute the value(s)](https://www.w3.org/TR/webaudio/#computation-of-value) of this `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` for this block.
            3.  [Queue a control message](https://www.w3.org/TR/webaudio/#queuing) to set the `[[[current value]]](https://www.w3.org/TR/webaudio/#dom-audioparam-current-value-slot)` slot of this `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` according to [§ 1.6.3 Computation of Value](https://www.w3.org/TR/webaudio/#computation-of-value).

        2.  If this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` has any `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s connected to its input, [sum](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) the buffers [made available for reading](https://www.w3.org/TR/webaudio/#available-for-reading) by all `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s connected to this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`. The resulting buffer is called the input buffer. [Up or down-mix](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing) it to match if number of input channels of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.
        3.  If this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` is a [source node](https://www.w3.org/TR/webaudio/#source-node), [compute a block of audio](https://www.w3.org/TR/webaudio/#computing-a-block-of-audio), and [make it available for reading](https://www.w3.org/TR/webaudio/#available-for-reading).
        4.  If this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` is an `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`, execute these substeps:

            1.  Let processor be the associated `[AudioWorkletProcessor](https://www.w3.org/TR/webaudio/#audioworkletprocessor)` instance of `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.
            2.  Let O be the ECMAScript object corresponding to processor.
            3.  Let processCallback be an uninitialized variable.
            4.  Let completion be an uninitialized variable.
            5.  [Prepare to run script](https://html.spec.whatwg.org/multipage/webappapis.html#prepare-to-run-script) with the [current settings object](https://html.spec.whatwg.org/multipage/webappapis.html#current-settings-object).
            6.  [Prepare to run a callback](https://html.spec.whatwg.org/multipage/webappapis.html#prepare-to-run-a-callback) with the [current settings object](https://html.spec.whatwg.org/multipage/webappapis.html#current-settings-object).
            7.  Let getResult be [Get](https://tc39.github.io/ecma262/#sec-get-o-p)(O, "process").
            8.  If getResult is an [abrupt completion](https://tc39.github.io/ecma262/#sec-completion-record-specification-type), set completion to getResult and jump to the step labeled [return](https://www.w3.org/TR/webaudio/#audio-worklet-render-return).
            9.  Set processCallback to getResult.\[\[Value\]\].
            10. If [!](https://tc39.es/ecma262/#sec-returnifabrupt-shorthands) [IsCallable](https://tc39.es/ecma262/#sec-iscallable)(processCallback) is `false`, then:

            11. Set completion to new [Completion](https://tc39.es/ecma262/#sec-throwcompletion) {\[\[Type\]\]: throw, \[\[Value\]\]: a newly created [TypeError](https://tc39.es/ecma262/#sec-native-error-types-used-in-this-standard-typeerror) object, \[\[Target\]\]: empty}.
            12. Jump to the step labeled [return](https://www.w3.org/TR/webaudio/#audio-worklet-render-return).
            13. Set `[[[callable process]]](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-callable-process-slot)` to `true`.

            14. Perform the following substeps:

            15. Let args be a [Web IDL arguments list](https://heycam.github.io/webidl/#web-idl-arguments-list) consisting of `[inputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-inputs)`, `[outputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-outputs)`, and `[parameters](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-parameters)`.
            16. Let esArgs be the result of [converting](https://heycam.github.io/webidl/#web-idl-arguments-list-converting) args to an ECMAScript arguments list.
            17. Let callResult be the [Call](https://tc39.github.io/ecma262/#sec-call)(processCallback, O, esArgs). This operation [computes a block of audio](https://www.w3.org/TR/webaudio/#computing-a-block-of-audio) with esArgs. Upon a successful function call, a buffer containing copies of the elements of the `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)`s passed via the `[outputs](https://www.w3.org/TR/webaudio/#dom-audioworkletprocesscallback-outputs)` is [made available for reading](https://www.w3.org/TR/webaudio/#available-for-reading). Any `[Promise](https://heycam.github.io/webidl/#idl-promise)` resolved within this call will be queued into the microtask queue in the `[AudioWorkletGlobalScope](https://www.w3.org/TR/webaudio/#audioworkletglobalscope)`.
            18. If callResult is an [abrupt completion](https://tc39.github.io/ecma262/#sec-completion-record-specification-type), set completion to callResult and jump to the step labeled [return](https://www.w3.org/TR/webaudio/#audio-worklet-render-return).
            19. Set processor’s [active source](https://www.w3.org/TR/webaudio/#active-source) flag to [ToBoolean](https://tc39.github.io/ecma262/#sec-toboolean)(callResult.\[\[Value\]\]).
            20. **Return:** at this point completion will be set to an ECMAScript [completion](https://tc39.es/ecma262/#sec-completion-record-specification-type) value.

            21. [Clean up after running a callback](https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-a-callback) with the [current settings object](https://html.spec.whatwg.org/multipage/webappapis.html#current-settings-object).
            22. [Clean up after running script](https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-script) with the [current settings object](https://html.spec.whatwg.org/multipage/webappapis.html#current-settings-object).
            23. If completion is an [abrupt completion](https://tc39.github.io/ecma262/#sec-completion-record-specification-type):

                1.  Set `[[[callable process]]](https://www.w3.org/TR/webaudio/#dom-audioworkletprocessor-callable-process-slot)` to `false`.
                2.  Set processor’s [active source](https://www.w3.org/TR/webaudio/#active-source) flag to `false`.
                3.  [Make a silent output buffer available for reading](https://www.w3.org/TR/webaudio/#available-for-reading).
                4.  [Queue a task](https://html.spec.whatwg.org/multipage/webappapis.html#queue-a-task) to the [control thread](https://www.w3.org/TR/webaudio/#control-thread) [fire](https://dom.spec.whatwg.org/#concept-event-fire) an `[ErrorEvent](https://html.spec.whatwg.org/multipage/webappapis.html#errorevent)` named `processorerror` at the associated `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)`.

        5.  If this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` is a [destination node](https://www.w3.org/TR/webaudio/#destination-node), [record the input](https://www.w3.org/TR/webaudio/#recording-the-input) of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`.
        6.  Else, [process](https://www.w3.org/TR/webaudio/#processing-input-buffer) the [input buffer](https://www.w3.org/TR/webaudio/#input-buffer), and [make available for reading](https://www.w3.org/TR/webaudio/#available-for-reading) the resulting buffer.

    5.  [Atomically](https://www.w3.org/TR/webaudio/#atomically) perform the following steps:

        1.  Increment `[[[current frame]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-current-frame-slot)` by the [render quantum size](https://www.w3.org/TR/webaudio/#render-quantum-size).
        2.  Set `[currentTime](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-currenttime)` to `[[[current frame]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-current-frame-slot)` divided by `[sampleRate](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-samplerate)`.

    6.  Set render result to `true`.

5.  [Perform a microtask checkpoint](https://html.spec.whatwg.org/multipage/webappapis.html#perform-a-microtask-checkpoint).
6.  Return render result.

Muting an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` means that its output MUST be silence for the rendering of this audio block.

Making a buffer available for reading from an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` means putting it in a state where other `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s connected to this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` can safely read from it.

Note: For example, implementations can choose to allocate a new buffer, or have a more elaborate mechanism, reusing an existing buffer that is now unused.

Recording the input of an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` means copying the input data of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` for future usage.

Computing a block of audio means running the algorithm for this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` to produce 128 sample-frames.

Processing an input buffer means running the algorithm for an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`, using an [input buffer](https://www.w3.org/TR/webaudio/#input-buffer) and the value(s) of the `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`(s) of this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` as the input for this algorithm.

### 2.5. Unloading a document[](https://www.w3.org/TR/webaudio/#unloading-a-document)

Additional [unloading document cleanup steps](https://html.spec.whatwg.org/#unloading-document-cleanup-steps) are defined for documents that use `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)`:

1.  Reject all the promises of `[[[pending promises]]](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-pending-promises-slot)` with `InvalidStateError`, for each `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` and `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)` whose relevant global object is the same as the document’s associated Window.
2.  Stop all `[decoding thread](https://www.w3.org/TR/webaudio/#dom-baseaudiocontext-decoding-thread)`s.
3.  [Queue a control message](https://www.w3.org/TR/webaudio/#queuing) to `[close()](https://www.w3.org/TR/webaudio/#dom-audiocontext-close)` the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` or `[OfflineAudioContext](https://www.w3.org/TR/webaudio/#offlineaudiocontext)`.

## 3\. Dynamic Lifetime[](https://www.w3.org/TR/webaudio/#DynamicLifetime)

### 3.1. Background[](https://www.w3.org/TR/webaudio/#dynamic-lifetime-background)

Note: The normative description of `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` and `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` lifetime characteristics is described by the [AudioContext lifetime](https://www.w3.org/TR/webaudio/#lifetime-AudioContext) and [AudioNode lifetime](https://www.w3.org/TR/webaudio/#AudioNode-actively-processing).

_This section is non-normative._

In addition to allowing the creation of static routing configurations, it should also be possible to do custom effect routing on dynamically allocated voices which have a limited lifetime. For the purposes of this discussion, let’s call these short-lived voices "notes". Many audio applications incorporate the ideas of notes, examples being drum machines, sequencers, and 3D games with many one-shot sounds being triggered according to game play.

In a traditional software synthesizer, notes are dynamically allocated and released from a pool of available resources. The note is allocated when a MIDI note-on message is received. It is released when the note has finished playing either due to it having reached the end of its sample-data (if non-looping), it having reached a sustain phase of its envelope which is zero, or due to a MIDI note-off message putting it into the release phase of its envelope. In the MIDI note-off case, the note is not released immediately, but only when the release envelope phase has finished. At any given time, there can be a large number of notes playing but the set of notes is constantly changing as new notes are added into the routing graph, and old ones are released.

The audio system automatically deals with tearing-down the part of the routing graph for individual "note" events. A "note" is represented by an `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`, which can be directly connected to other processing nodes. When the note has finished playing, the context will automatically release the reference to the `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`, which in turn will release references to any nodes it is connected to, and so on. The nodes will automatically get disconnected from the graph and will be deleted when they have no more references. Nodes in the graph which are long-lived and shared between dynamic voices can be managed explicitly. Although it sounds complicated, this all happens automatically with no extra handling required.

### 3.2. Example[](https://www.w3.org/TR/webaudio/#dynamic-lifetime-example)

![dynamic allocation](https://www.w3.org/TR/webaudio/images/dynamic-allocation.png)

A graph featuring a subgraph that will be releases early.

The low-pass filter, panner, and second gain nodes are directly connected from the one-shot sound. So when it has finished playing the context will automatically release them (everything within the dotted line). If there are no longer any references to the one-shot sound and connected nodes, then they will be immediately removed from the graph and deleted. The streaming source has a global reference and will remain connected until it is explicitly disconnected. Here’s how it might look in JavaScript:

[](https://www.w3.org/TR/webaudio/#example-9dbf5ad3)let context \= 0;let compressor \= 0;let gainNode1 \= 0;let streamingAudioSource \= 0;// Initial setup of the "long-lived" part of the routing graphfunction setupAudioContext() { context \= new AudioContext(); compressor \= context.createDynamicsCompressor(); gainNode1 \= context.createGain(); // Create a streaming audio source. const audioElement \= document.getElementById('audioTagID'); streamingAudioSource \= context.createMediaElementSource(audioElement); streamingAudioSource.connect(gainNode1); gainNode1.connect(compressor); compressor.connect(context.destination);}// Later in response to some user action (typically mouse or key event)// a one-shot sound can be played.function playSound() { const oneShotSound \= context.createBufferSource(); oneShotSound.buffer \= dogBarkingBuffer; // Create a filter, panner, and gain node. const lowpass \= context.createBiquadFilter(); const panner \= context.createPanner(); const gainNode2 \= context.createGain(); // Make connections oneShotSound.connect(lowpass); lowpass.connect(panner); panner.connect(gainNode2); gainNode2.connect(compressor); // Play 0.75 seconds from now (to play immediately pass in 0) oneShotSound.start(context.currentTime + 0.75);}

## 4\. Channel Up-Mixing and Down-Mixing[](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing)

_This section is normative._

An AudioNode input has mixing rules for combining the channels from all of the connections to it. As a simple example, if an input is connected from a mono output and a stereo output, then the mono connection will usually be up-mixed to stereo and summed with the stereo connection. But, of course, it’s important to define the exact [mixing rules](https://www.w3.org/TR/webaudio/#mixing-rules) for every input to every `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`. The default mixing rules for all of the inputs have been chosen so that things "just work" without worrying too much about the details, especially in the very common case of mono and stereo streams. Of course, the rules can be changed for advanced use cases, especially multi-channel.

To define some terms, up-mixing refers to the process of taking a stream with a smaller number of channels and converting it to a stream with a larger number of channels. down-mixing refers to the process of taking a stream with a larger number of channels and converting it to a stream with a smaller number of channels.

An `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` input needs to mix all the outputs connected to this input. As part of this process it computes an internal value [computedNumberOfChannels](https://www.w3.org/TR/webaudio/#computednumberofchannels) representing the actual number of channels of the input at any given time.

### 4.1. Speaker Channel Layouts[](https://www.w3.org/TR/webaudio/#ChannelLayouts)

When `[channelInterpretation](https://www.w3.org/TR/webaudio/#dom-audionode-channelinterpretation)` is "`[speakers](https://www.w3.org/TR/webaudio/#dom-channelinterpretation-speakers)`" then the [up-mixing](https://www.w3.org/TR/webaudio/#up-mixing) and [down-mixing](https://www.w3.org/TR/webaudio/#down-mixing) is defined for specific channel layouts.

Mono (one channel), stereo (two channels), quad (four channels), and 5.1 (six channels) MUST be supported. Other channel layouts may be supported in future version of this specification.

### 4.2. Channel Ordering[](https://www.w3.org/TR/webaudio/#ChannelOrdering)

Channel ordering is defined by the following table. Individual multichannel formats MAY not support all intermediate channels. Implementations MUST present the channels provided in the order defined below, skipping over those channels not present.

Order

Label

Mono

Stereo

Quad

5.1

0

SPEAKER_FRONT_LEFT

0

0

0

0

1

SPEAKER_FRONT_RIGHT

1

1

1

2

SPEAKER_FRONT_CENTER

2

3

SPEAKER_LOW_FREQUENCY

3

4

SPEAKER_BACK_LEFT

2

4

5

SPEAKER_BACK_RIGHT

3

5

6

SPEAKER_FRONT_LEFT_OF_CENTER

7

SPEAKER_FRONT_RIGHT_OF_CENTER

8

SPEAKER_BACK_CENTER

9

SPEAKER_SIDE_LEFT

10

SPEAKER_SIDE_RIGHT

11

SPEAKER_TOP_CENTER

12

SPEAKER_TOP_FRONT_LEFT

13

SPEAKER_TOP_FRONT_CENTER

14

SPEAKER_TOP_FRONT_RIGHT

15

SPEAKER_TOP_BACK_LEFT

16

SPEAKER_TOP_BACK_CENTER

17

SPEAKER_TOP_BACK_RIGHT

### 4.3. Implication of tail-time on input and output channel count[](https://www.w3.org/TR/webaudio/#channels-tail-time)

When an `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` has a non-zero [tail-time](https://www.w3.org/TR/webaudio/#tail-time), and an output channel count that depends on the input channels count, the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`'s [tail-time](https://www.w3.org/TR/webaudio/#tail-time) must be taken into account when the input channel count changes.

When there is a decrease in input channel count, the change in output channel count MUST happen when the input that was received with greater channel count no longer affects the output.

When there is an increase in input channel count, the behavior depends on the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` type:

- For a `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)` or a `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)`, the number of output channels MUST increase when the input that was received with greater channel count begins to affect the output.
- For other `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s that have a [tail-time](https://www.w3.org/TR/webaudio/#tail-time), the number of output channels MUST increase immediately.

  Note: For a `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)`, this only applies to the case where the impulse response is mono. Otherwise, the `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` always outputs a stereo signal regardless of its input channel count.

Note: Intuitively, this allows not losing stereo information as part of processing: when multiple input render quanta of different channel count contribute to an output render quantum then the output render quantum’s channel count is a superset of the input channel count of the input render quantums.

### 4.4. Up Mixing Speaker Layouts[](https://www.w3.org/TR/webaudio/#UpMix-sub)

Mono up-mix:

1 -> 2 : up-mix from mono to stereo
output.L = input;
output.R = input;

1 -> 4 : up-mix from mono to quad
output.L = input;
output.R = input;
output.SL = 0;
output.SR = 0;

1 -> 5.1 : up-mix from mono to 5.1
output.L = 0;
output.R = 0;
output.C = input; // put in center channel
output.LFE = 0;
output.SL = 0;
output.SR = 0;

Stereo up-mix:

2 -> 4 : up-mix from stereo to quad
output.L = input.L;
output.R = input.R;
output.SL = 0;
output.SR = 0;

2 -> 5.1 : up-mix from stereo to 5.1
output.L = input.L;
output.R = input.R;
output.C = 0;
output.LFE = 0;
output.SL = 0;
output.SR = 0;

Quad up-mix:

4 -> 5.1 : up-mix from quad to 5.1
output.L = input.L;
output.R = input.R;
output.C = 0;
output.LFE = 0;
output.SL = input.SL;
output.SR = input.SR;

### 4.5. Down Mixing Speaker Layouts[](https://www.w3.org/TR/webaudio/#down-mix)

A down-mix will be necessary, for example, if processing 5.1 source material, but playing back stereo.

Mono down-mix:

2 -> 1 : stereo to mono
output = 0.5 \* (input.L + input.R);

4 -> 1 : quad to mono
output = 0.25 \* (input.L + input.R + input.SL + input.SR);

5.1 -> 1 : 5.1 to mono
output = sqrt(0.5) \* (input.L + input.R) + input.C + 0.5 \* (input.SL + input.SR)

Stereo down-mix:

4 -> 2 : quad to stereo
output.L = 0.5 \* (input.L + input.SL);
output.R = 0.5 \* (input.R + input.SR);

5.1 -> 2 : 5.1 to stereo
output.L = L + sqrt(0.5) \* (input.C + input.SL)
output.R = R + sqrt(0.5) \* (input.C + input.SR)

Quad down-mix:

5.1 -> 4 : 5.1 to quad
output.L = L + sqrt(0.5) \* input.C
output.R = R + sqrt(0.5) \* input.C
output.SL = input.SL
output.SR = input.SR

### 4.6. Channel Rules Examples[](https://www.w3.org/TR/webaudio/#ChannelRules-section)

[](https://www.w3.org/TR/webaudio/#example-c5d47e05)// Set gain node to explicit 2-channels (stereo).gain.channelCount \= 2;gain.channelCountMode \= "explicit";gain.channelInterpretation \= "speakers";// Set "hardware output" to 4-channels for DJ-app with two stereo output busses.context.destination.channelCount \= 4;context.destination.channelCountMode \= "explicit";context.destination.channelInterpretation \= "discrete";// Set "hardware output" to 8-channels for custom multi-channel speaker array// with custom matrix mixing.context.destination.channelCount \= 8;context.destination.channelCountMode \= "explicit";context.destination.channelInterpretation \= "discrete";// Set "hardware output" to 5.1 to play an HTMLAudioElement.context.destination.channelCount \= 6;context.destination.channelCountMode \= "explicit";context.destination.channelInterpretation \= "speakers";// Explicitly down-mix to mono.gain.channelCount \= 1;gain.channelCountMode \= "explicit";gain.channelInterpretation \= "speakers";

## 5\. Audio Signal Values[](https://www.w3.org/TR/webaudio/#audio-signal-values)

### 5.1. Audio sample format[](https://www.w3.org/TR/webaudio/#audio-sample-format)

Linear pulse code modulation (linear PCM) describes a format where the audio values are sampled at a regular interval, and where the quantization levels between two successive values are linearly uniform.

Whenever signal values are exposed to script in this specification, they are in linear 32-bit floating point pulse code modulation format (linear 32-bit float PCM), often in the form of `[Float32Array](https://heycam.github.io/webidl/#idl-Float32Array)` objects.

### 5.2. Rendering[](https://www.w3.org/TR/webaudio/#audio-values-rendering)

The range of all audio signals at a destination node of any audio graph is nominally \[-1, 1\]. The audio rendition of signal values outside this range, or of the values `NaN`, positive infinity or negative infinity, is undefined by this specification.

## 6\. Spatialization/Panning[](https://www.w3.org/TR/webaudio/#Spatialization)

### 6.1. Background[](https://www.w3.org/TR/webaudio/#Spatialization-background)

A common feature requirement for modern 3D games is the ability to dynamically spatialize and move multiple audio sources in 3D space. For example [OpenAL](https://openal.org/) has this ability.

Using a `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`, an audio stream can be spatialized or positioned in space relative to an `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)`. A `[BaseAudioContext](https://www.w3.org/TR/webaudio/#baseaudiocontext)` will contain a single `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)`. Both panners and listeners have a position in 3D space using a right-handed cartesian coordinate system. The units used in the coordinate system are not defined, and do not need to be because the effects calculated with these coordinates are independent/invariant of any particular units such as meters or feet. `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` objects (representing the source stream) have an _orientation_ vector representing in which direction the sound is projecting. Additionally, they have a _sound cone_ representing how directional the sound is. For example, the sound could be omnidirectional, in which case it would be heard anywhere regardless of its orientation, or it can be more directional and heard only if it is facing the listener. `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` objects (representing a person’s ears) have [forward](https://www.w3.org/TR/webaudio/#audiolistener-forward) and [up](https://www.w3.org/TR/webaudio/#audiolistener-up) vectors representing in which direction the person is facing.

The coordinate system for spatialization is shown in the diagram below, with the default values shown. The locations for the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)` and `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` are moved from the default positions so we can see things better.

![panner-coord](https://www.w3.org/TR/webaudio/images/panner-coord.svg)

Diagram of the coordinate system with AudioListener and PannerNode attributes shown.

During rendering, the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` calculates an _azimuth_ and _elevation_. These values are used internally by the implementation in order to render the spatialization effect. See the [Panning Algorithm](https://www.w3.org/TR/webaudio/#Spatialization-panning-algorithm) section for details of how these values are used.

### 6.2. Azimuth and Elevation[](https://www.w3.org/TR/webaudio/#azimuth-elevation)

The following algorithm MUST be used to calculate the _azimuth_ and _elevation_ for the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`. The implementation must appropriately account for whether the various `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s below are "`[a-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-a-rate)`" or "`[k-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-k-rate)`".

// Let |context| be a BaseAudioContext and let |panner| be a// PannerNode created in |context|.// Calculate the source-listener vector.const listener \= context.listener;const sourcePosition \= new Vec3(panner.positionX.value, panner.positionY.value, panner.positionZ.value);const listenerPosition \= new Vec3(listener.positionX.value, listener.positionY.value, listener.positionZ.value);const sourceListener \= sourcePosition.diff(listenerPosition).normalize();if (sourceListener.magnitude \== 0) { // Handle degenerate case if source and listener are at the same point. azimuth \= 0; elevation \= 0; return;}// Align axes.const listenerForward \= new Vec3(listener.forwardX.value, listener.forwardY.value, listener.forwardZ.value);const listenerUp \= new Vec3(listener.upX.value, listener.upY.value, listener.upZ.value);const listenerRight \= listenerForward.cross(listenerUp);if (listenerRight.magnitude \== 0) { // Handle the case where listener’s 'up' and 'forward' vectors are linearly // dependent, in which case 'right' cannot be determined azimuth \= 0; elevation \= 0; return;}// Determine a unit vector orthogonal to listener’s right, forwardconst listenerRightNorm \= listenerRight.normalize();const listenerForwardNorm \= listenerForward.normalize();const up \= listenerRightNorm.cross(listenerForwardNorm);const upProjection \= sourceListener.dot(up);const projectedSource \= sourceListener.diff(up.scale(upProjection)).normalize();azimuth \= 180 \* Math.acos(projectedSource.dot(listenerRightNorm)) / Math.PI;// Source in front or behind the listener.const frontBack \= projectedSource.dot(listenerForwardNorm);if (frontBack < 0) azimuth \= 360 \- azimuth;// Make azimuth relative to "forward" and not "right" listener vector.if ((azimuth \>= 0) && (azimuth <= 270)) azimuth \= 90 \- azimuth;else azimuth \= 450 \- azimuth;elevation \= 90 \- 180 \* Math.acos(sourceListener.dot(up)) / Math.PI;if (elevation \> 90) elevation \= 180 \- elevation;else if (elevation < \-90) elevation \= \-180 \- elevation;

### 6.3. Panning Algorithm[](https://www.w3.org/TR/webaudio/#Spatialization-panning-algorithm)

_Mono-to-stereo_ and _stereo-to-stereo_ panning MUST be supported. _Mono-to-stereo_ processing is used when all connections to the input are mono. Otherwise _stereo-to-stereo_ processing is used.

#### 6.3.1. PannerNode "equalpower" Panning[](https://www.w3.org/TR/webaudio/#Spatialization-equal-power-panning)

This is a simple and relatively inexpensive algorithm which provides basic, but reasonable results. It is used for the for the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` when the `[panningModel](https://www.w3.org/TR/webaudio/#dom-pannernode-panningmodel)` attribute is set to "`[equalpower](https://www.w3.org/TR/webaudio/#dom-panningmodeltype-equalpower)`", in which case the _elevation_ value is ignored. This algorithm MUST be implemented using the appropriate rate as specified by the `[automationRate](https://www.w3.org/TR/webaudio/#dom-audioparam-automationrate)`. If any of the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`'s `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s or the `[AudioListener](https://www.w3.org/TR/webaudio/#audiolistener)`'s `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`s are "`[a-rate](https://www.w3.org/TR/webaudio/#dom-automationrate-a-rate)`", [a-rate](https://www.w3.org/TR/webaudio/#a-rate) processing must be used.

1.  For each sample to be computed by this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`:

    1.  Let azimuth be the value computed in the [azimuth and elevation](https://www.w3.org/TR/webaudio/#azimuth-elevation) section.
    2.  The azimuth value is first contained to be within the range \[-90, 90\] according to:

        // First, clamp azimuth to allowed range of \[-180, 180\].
        azimuth \= max(\-180, azimuth);
        azimuth \= min(180, azimuth);

        // Then wrap to range \[-90, 90\].
        if (azimuth < \-90)
        azimuth \= \-180 \- azimuth;
        else if (azimuth \> 90)
        azimuth \= 180 \- azimuth;

    3.  A normalized value _x_ is calculated from azimuth for a mono input as:

        x \= (azimuth + 90) / 180;

        Or for a stereo input as:

        if (azimuth <= 0) { // -90 -> 0
        // Transform the azimuth value from \[-90, 0\] degrees into the range \[-90, 90\].
        x \= (azimuth + 90) / 90;
        } else { // 0 -> 90
        // Transform the azimuth value from \[0, 90\] degrees into the range \[-90, 90\].
        x \= azimuth / 90;
        }

    4.  Left and right gain values are calculated as:

        gainL \= cos(x \* Math.PI / 2);
        gainR \= sin(x \* Math.PI / 2);

    5.  For mono input, the stereo output is calculated as:

        outputL \= input \* gainL;
        outputR \= input \* gainR;

        Else for stereo input, the output is calculated as:

        if (azimuth <= 0) {
        outputL \= inputL + inputR \* gainL;
        outputR \= inputR \* gainR;
        } else {
        outputL \= inputL \* gainL;
        outputR \= inputR + inputL \* gainR;
        }

    6.  Apply the distance gain and cone gain where the computation of the distance is described in [Distance Effects](https://www.w3.org/TR/webaudio/#Spatialization-distance-effects) and the cone gain is described in [Sound Cones](https://www.w3.org/TR/webaudio/#Spatialization-sound-cones):

        let distance \= distance();
        let distanceGain \= distanceModel(distance);
        let totalGain \= coneGain() \* distanceGain();
        outputL \= totalGain \* outputL;
        outputR \= totalGain \* outputR;

#### 6.3.2. PannerNode "HRTF" Panning (Stereo Only)[](https://www.w3.org/TR/webaudio/#Spatialization-hrtf-panning)

This requires a set of [HRTF](https://en.wikipedia.org/wiki/Head-related_transfer_function) (Head-related Transfer Function) impulse responses recorded at a variety of azimuths and elevations. The implementation requires a highly optimized convolution function. It is somewhat more costly than "equalpower", but provides more perceptually spatialized sound.

![](https://www.w3.org/TR/webaudio/images/HRTF_panner.png)

A diagram showing the process of panning a source using HRTF.

#### 6.3.3. StereoPannerNode Panning[](https://www.w3.org/TR/webaudio/#stereopanner-algorithm)

For a `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)`, the following algorithm MUST be implemented.

1.  For each sample to be computed by this `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`

    1.  Let pan be the [computedValue](https://www.w3.org/TR/webaudio/#computedvalue) of the `pan` `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)` of this `[StereoPannerNode](https://www.w3.org/TR/webaudio/#stereopannernode)`.
    2.  Clamp pan to \[-1, 1\].

        pan \= max(\-1, pan);
        pan \= min(1, pan);

    3.  Calculate _x_ by normalizing pan value to \[0, 1\]. For mono input:

        x \= (pan + 1) / 2;

        For stereo input:

        if (pan <= 0)
        x \= pan + 1;
        else
        x \= pan;

    4.  Left and right gain values are calculated as:

        gainL \= cos(x \* Math.PI / 2);
        gainR \= sin(x \* Math.PI / 2);

    5.  For mono input, the stereo output is calculated as:

        outputL \= input \* gainL;
        outputR \= input \* gainR;

        Else for stereo input, the output is calculated as:

        if (pan <= 0) {
        outputL \= inputL + inputR \* gainL;
        outputR \= inputR \* gainR;
        } else {
        outputL \= inputL \* gainL;
        outputR \= inputR + inputL \* gainR;
        }

### 6.4. Distance Effects[](https://www.w3.org/TR/webaudio/#Spatialization-distance-effects)

Sounds which are closer are louder, while sounds further away are quieter. Exactly _how_ a sound’s volume changes according to distance from the listener depends on the `[distanceModel](https://www.w3.org/TR/webaudio/#dom-pannernode-distancemodel)` attribute.

During audio rendering, a _distance_ value will be calculated based on the panner and listener positions according to:

function distance(panner) { const pannerPosition \= new Vec3(panner.positionX.value, panner.positionY.value, panner.positionZ.value); const listener \= context.listener; const listenerPosition \= new Vec3(listener.positionX.value, listener.positionY.value, listener.positionZ.value); return pannerPosition.diff(listenerPosition).magnitude;}

_distance_ will then be used to calculate _distanceGain_ which depends on the `[distanceModel](https://www.w3.org/TR/webaudio/#dom-pannernode-distancemodel)` attribute. See the `[DistanceModelType](https://www.w3.org/TR/webaudio/#enumdef-distancemodeltype)` section for details of how this is calculated for each distance model.

As part of its processing, the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)` scales/multiplies the input audio signal by _distanceGain_ to make distant sounds quieter and nearer ones louder.

### 6.5. Sound Cones[](https://www.w3.org/TR/webaudio/#Spatialization-sound-cones)

The listener and each sound source have an orientation vector describing which way they are facing. Each sound source’s sound projection characteristics are described by an inner and outer "cone" describing the sound intensity as a function of the source/listener angle from the source’s orientation vector. Thus, a sound source pointing directly at the listener will be louder than if it is pointed off-axis. Sound sources can also be omni-directional.

The following diagram ilustrates the relationship between the source’s cone with respect to the listener. In the diagram, `` `[coneInnerAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneinnerangle)` = 50`` and `` `[coneOuterAngle](https://www.w3.org/TR/webaudio/#dom-pannernode-coneouterangle)` = 120``. That is, the inner cone extends 25 deg on each side of the direction vector. Similarly, the outer cone is 60 deg on each side.

![cone-diagram](https://www.w3.org/TR/webaudio/images/cone-diagram.svg)

Cone angles for a source in relationship to the source orientation and the listeners position and orientation.

The following algorithm MUST be used to calculate the gain contribution due to the cone effect, given the source (the `[PannerNode](https://www.w3.org/TR/webaudio/#pannernode)`) and the listener:

function coneGain() { const sourceOrientation \= new Vec3(source.orientationX, source.orientationY, source.orientationZ); if (sourceOrientation.magnitude \== 0 || ((source.coneInnerAngle \== 360) && (source.coneOuterAngle \== 360))) return 1; // no cone specified - unity gain // Normalized source-listener vector const sourcePosition \= new Vec3(panner.positionX.value, panner.positionY.value, panner.positionZ.value); const listenerPosition \= new Vec3(listener.positionX.value, listener.positionY.value, listener.positionZ.value); const sourceToListener \= sourcePosition.diff(listenerPosition).normalize(); const normalizedSourceOrientation \= sourceOrientation.normalize(); // Angle between the source orientation vector and the source-listener vector const angle \= 180 \* Math.acos(sourceToListener.dot(normalizedSourceOrientation)) / Math.PI; const absAngle \= Math.abs(angle); // Divide by 2 here since API is entire angle (not half-angle) const absInnerAngle \= Math.abs(source.coneInnerAngle) / 2; const absOuterAngle \= Math.abs(source.coneOuterAngle) / 2; let gain \= 1; if (absAngle <= absInnerAngle) { // No attenuation gain \= 1; } else if (absAngle \>= absOuterAngle) { // Max attenuation gain \= source.coneOuterGain; } else { // Between inner and outer cones // inner -> outer, x goes from 0 -> 1 const x \= (absAngle \- absInnerAngle) / (absOuterAngle \- absInnerAngle); gain \= (1 \- x) + source.coneOuterGain \* x; } return gain;}

## 7\. Performance Considerations[](https://www.w3.org/TR/webaudio/#Performance)

### 7.1. Latency[](https://www.w3.org/TR/webaudio/#latency)

![latency](https://www.w3.org/TR/webaudio/images/latency.png)

Use cases in which the latency can be important

For web applications, the time delay between mouse and keyboard events (keydown, mousedown, etc.) and a sound being heard is important.

This time delay is called latency and is caused by several factors (input device latency, internal buffering latency, DSP processing latency, output device latency, distance of user’s ears from speakers, etc.), and is cumulative. The larger this latency is, the less satisfying the user’s experience is going to be. In the extreme, it can make musical production or game-play impossible. At moderate levels it can affect timing and give the impression of sounds lagging behind or the game being non-responsive. For musical applications the timing problems affect rhythm. For gaming, the timing problems affect precision of gameplay. For interactive applications, it generally cheapens the users experience much in the same way that very low animation frame-rates do. Depending on the application, a reasonable latency can be from as low as 3-6 milliseconds to 25-50 milliseconds.

Implementations will generally seek to minimize overall latency.

Along with minimizing overall latency, implementations will generally seek to minimize the difference between an `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`'s `currentTime` and an `[AudioProcessingEvent](https://www.w3.org/TR/webaudio/#audioprocessingevent)`'s `playbackTime`. Deprecation of `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` will make this consideration less important over time.

Additionally, some `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s can add latency to some paths of the audio graph, notably:

- The `[AudioWorkletNode](https://www.w3.org/TR/webaudio/#audioworkletnode)` can run a script that buffers internally, adding delay to the signal path.
- The `[DelayNode](https://www.w3.org/TR/webaudio/#delaynode)`, whose role is to add controlled latency time.
- The `[BiquadFilterNode](https://www.w3.org/TR/webaudio/#biquadfilternode)` and `[IIRFilterNode](https://www.w3.org/TR/webaudio/#iirfilternode)` filter design can delay incoming samples, as a natural consequence of the causal filtering process.
- The `[ConvolverNode](https://www.w3.org/TR/webaudio/#convolvernode)` depending on the impulse, can delay incoming samples, as a natural result of the convolution operation.
- The `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` has a look ahead algorithm that causes delay in the signal path.
- The `[MediaStreamAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamaudiosourcenode)`, `[MediaStreamTrackAudioSourceNode](https://www.w3.org/TR/webaudio/#mediastreamtrackaudiosourcenode)` and `[MediaStreamAudioDestinationNode](https://www.w3.org/TR/webaudio/#mediastreamaudiodestinationnode)`, depending on the implementation, can add buffers internally that add delays.
- The `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` can have buffers between the control thread and the rendering thread.
- The `[WaveShaperNode](https://www.w3.org/TR/webaudio/#waveshapernode)`, when oversampling, and depending on the oversampling technique, add delays to the signal path.

### 7.2. Audio Buffer Copying[](https://www.w3.org/TR/webaudio/#audio-buffer-copying)

When an [acquire the content](https://www.w3.org/TR/webaudio/#acquire-the-content) operation is performed on an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, the entire operation can usually be implemented without copying channel data. In particular, the last step SHOULD be performed lazily at the next `[getChannelData()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata)` call. That means a sequence of consecutive [acquire the contents](https://www.w3.org/TR/webaudio/#acquire-the-content) operations with no intervening `[getChannelData()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata)` (e.g. multiple `[AudioBufferSourceNode](https://www.w3.org/TR/webaudio/#audiobuffersourcenode)`s playing the same `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`) can be implemented with no allocations or copying.

Implementations can perform an additional optimization: if `[getChannelData()](https://www.w3.org/TR/webaudio/#dom-audiobuffer-getchanneldata)` is called on an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`, fresh `[ArrayBuffer](https://heycam.github.io/webidl/#idl-ArrayBuffer)`s have not yet been allocated, but all invokers of previous [acquire the content](https://www.w3.org/TR/webaudio/#acquire-the-content) operations on an `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)` have stopped using the `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`'s data, the raw data buffers can be recycled for use with new `[AudioBuffer](https://www.w3.org/TR/webaudio/#audiobuffer)`s, avoiding any reallocation or copying of the channel data.

### 7.3. AudioParam Transitions[](https://www.w3.org/TR/webaudio/#audioparam-transitions)

While no automatic smoothing is done when directly setting the `[value](https://www.w3.org/TR/webaudio/#dom-audioparam-value)` attribute of an `[AudioParam](https://www.w3.org/TR/webaudio/#audioparam)`, for certain parameters, smooth transition are preferable to directly setting the value.

Using the `[setTargetAtTime()](https://www.w3.org/TR/webaudio/#dom-audioparam-settargetattime)` method with a low `timeConstant` allows authors to perform a smooth transition.

### 7.4. Audio Glitching[](https://www.w3.org/TR/webaudio/#audio-glitching)

Audio glitches are caused by an interruption of the normal continuous audio stream, resulting in loud clicks and pops. It is considered to be a catastrophic failure of a multi-media system and MUST be avoided. It can be caused by problems with the threads responsible for delivering the audio stream to the hardware, such as scheduling latencies caused by threads not having the proper priority and time-constraints. It can also be caused by the audio DSP trying to do more work than is possible in real-time given the CPU’s speed.

## 8\. Security and Privacy Considerations[](https://www.w3.org/TR/webaudio/#priv-sec)

Per the [Self-Review Questionnaire: Security and Privacy §questions](https://www.w3.org/TR/security-privacy-questionnaire/#questions):

1.  Does this specification deal with personally-identifiable information?

    It would be possible to perform a hearing test using Web Audio API, thus revealing the range of frequencies audible to a person (this decreases with age). It is difficult to see how this could be done without the realization and consent of the user, as it requires active particpation.

2.  Does this specification deal with high-value data?

    No. Credit card information and the like is not used in Web Audio. It is possible to use Web Audio to process or analyze voice data, which might be a privacy concern, but access to the user’s microphone is permission-based via `[getUserMedia()](https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia)`.

3.  Does this specification introduce new state for an origin that persists across browsing sessions?

    No. AudioWorklet does not persist across browsing sessions.

4.  Does this specification expose persistent, cross-origin state to the web?

    Yes, the supported audio sample rate(s) and the output device channel count are exposed. See `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)`.

5.  Does this specification expose any other data to an origin that it doesn’t currently have access to?

    Yes. When giving various information on available `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)`s, the Web Audio API potentially exposes information on characteristic features of the client (such as audio hardware sample-rate) to any page that makes use of the `[AudioNode](https://www.w3.org/TR/webaudio/#audionode)` interface. Additionally, timing information can be collected through the `[AnalyserNode](https://www.w3.org/TR/webaudio/#analysernode)` or `[ScriptProcessorNode](https://www.w3.org/TR/webaudio/#scriptprocessornode)` interface. The information could subsequently be used to create a fingerprint of the client.

    Research by Princeton CITP’s [](https://audiofingerprint.openwpm.com/)Web Transparency and Accountability Project has shown that `[DynamicsCompressorNode](https://www.w3.org/TR/webaudio/#dynamicscompressornode)` and `[OscillatorNode](https://www.w3.org/TR/webaudio/#oscillatornode)` can be used to gather entropy from a client to fingerprint a device. This is due to small, and normally inaudible, differences in DSP architecture, resampling strategies and rounding trade-offs between differing implementations. The precise compiler flags used and also the CPU architecture (ARM vs. x86) contribute to this entropy.

    In practice however, this merely allows deduction of information already readily available by easier means (User Agent string), such as "this is browser X running on platform Y". However, to reduce the possibility of additional fingerprinting, we mandate browsers take action to mitigate fingerprinting issues that might be possible from the output of any node.

    Fingerprinting via clock skew [has been described by Steven J Murdoch and Sebastian Zander](https://murdoch.is/talks/eurobsdcon07hotornot.pdf). It might be possible to determine this from `[getOutputTimestamp](https://www.w3.org/TR/webaudio/#dom-audiocontext-getoutputtimestamp)`. Skew-based fingerprinting has also been demonstrated [by Nakibly et. al. for HTML](https://pdfs.semanticscholar.org/cfd2/6a17234696593919df3f880a235d6ac5871d.pdf). The [High-Resolution Time §7 Privacy and Security](https://w3c.github.io/hr-time/#sec-privacy-security) section should be consulted for further information on clock resolution and drift.

    Fingerprinting via latency is also possible; it might be possible to deduce this from `[baseLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-baselatency)` and `[outputLatency](https://www.w3.org/TR/webaudio/#dom-audiocontext-outputlatency)`. Mitigation strategies include adding jitter (dithering) and quantization so that the exact skew is incorrectly reported. Note however that most audio systems aim for [low latency](https://padenot.github.io/web-audio-perf/#latency), to synchronise the audio generated by WebAudio to other audio or video sources or to visual cues (for example in a game, or an audio recording or music making environment). Excessive latency decreases usability and may be an accessibility issue.

    Fingerprining via the sample rate of the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is also possible. We recommend the following steps to be taken to minimize this:

    1.  44.1 kHz and 48 kHz are allowed as default rates; the system will choose between them for best applicability. (Obviously, if the audio device is natively 44.1, 44.1 will be chosen, etc., but also the system may choose the most "compatible" rate—e.g. if the system is natively 96kHz, 48kHz would likely be chosen, not 44.1kHz.
    2.  The system should resample to one of those two rates for devices that are natively at different rates, despite the fact that this may cause extra battery drain due to resampled audio. (Again, the system will choose the most compatible rate—e.g. if the native system is 16kHz, it’s expected that 48kHz would be chosen.)
    3.  It is expected (though not mandated) that browsers would offer a user affordance to force use of the native rate—e.g. by setting a flag in the browser on the device. This setting would not be exposed in the API.
    4.  It is also expected behavior that a different rate could be explicitly requested in the constructor for `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` (this is already in the specification; it normally causes the audio rendering to be done at the requested sampleRate, and then up- or down-sampled to the device output), and if that rate is natively supported, the rendering could be passed straight through. This would enable apps to render to higher rates without user intervention (although it’s not observable from Web Audio that the audio output is not downsampled on output)—for example, if `[MediaDevices](https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices)` capabilities were read (with user intervention) and indicated a higher rate was supported.

    Fingerprinting via the number of output channels for the `[AudioContext](https://www.w3.org/TR/webaudio/#audiocontext)` is possible as well. We recommend that `[maxChannelCount](https://www.w3.org/TR/webaudio/#dom-audiodestinationnode-maxchannelcount)` be set to two (stereo). Stereo is by far the most common number of channels.

6.  Does this specification enable new script execution/loading mechanisms?

    No. It does use the [\[HTML\]](https://www.w3.org/TR/webaudio/#biblio-html) script execution method, defined in that specification.

7.  Does this specification allow an origin access to a user’s location?

    No.

8.  Does this specification allow an origin access to sensors on a user’s device?

    Not directly. Currently, audio input is not specified in this document, but it will involve gaining access to the client machine’s audio input or microphone. This will require asking the user for permission in an appropriate way, probably via the `[getUserMedia()](https://www.w3.org/TR/mediacapture-streams/#dom-mediadevices-getusermedia)` API.

    Additionally, the security and privacy considerations from the [Media Capture and Streams](https://www.w3.org/TR/mediacapture-streams/) specification should be noted. In particular, analysis of ambient audio or playing unique audio may enable identification of user location down to the level of a room or even simultaneous occupation of a room by disparate users or devices. Access to both audio output and audio input might also enable communication between otherwise partitioned contexts in one browser.

9.  Does this specification allow an origin access to aspects of a user’s local computing environment?

    Not directly; all requested sample rates are supported, with upsampling if needed. It is possible to use Media Capture and Streams to probe for supported audio sample rates with [MediaTrackSupportedConstraints](https://www.w3.org/TR/mediacapture-streams/#media-track-supported-constraints). This requires explicit user consent. This does provide a small measure of fingerprinting. However, in practice most consumer and prosumer devices use one of two standardized sample rates: 44.1kHz (originally used by CD) and 48kHz (originally used by DAT). Highly resource constrained devices may support the speech-quality 11kHz sample rate, and higher-end devices often support 88.2, 96, or even the audiophile 192kHz rate.

    Requiring all implementations to upsample to a single, commonly-supported rate such as 48kHz would increase CPU cost for no particular benefit, and requiring higher-end devices to use a lower rate would merely result in Web Audio being labelled as unsuitable for professional use.

10. Does this specification allow an origin access to other devices?


    It typically does not allow access to other networked devices (an exception in a high-end recording studio might be Dante networked devices, although these typically use a separate, dedicated network). It does of necessity allow access to the user’s audio output device or devices, which are sometimes separate units to the computer.

    For voice or sound-actuated devices, Web Audio API _might_ be used to control other devices. In addition, if the sound-operated device is sensitive to near ultrasonic frequencies, such control might not be audible. This possibility also exists with HTML, through either the <audio> or <video> element. At common audio sampling rates, there is (by design) insufficient headroom for much ultrasonic information:

    The limit of human hearing is usually stated as 20kHz. For a 44.1kHz sampling rate, the Nyquist limit is 22.05kHz. Given that a true brickwall filter cannot be physically realized, the space between 20kHz and 22.05kHz is used for a rapid rolloff filter to strongly attenuate all frequencies above Nyquist.

    At 48kHz sampling rate, there is still rapid attenuation in the 20kHz to 24kHz band (but it is easier to avoid phase ripple errors in the passband).

11. Does this specification allow an origin some measure of control over a user agent’s native UI?


    If the UI has audio components, such as a voice assistant or screenreader, Web Audio API might be used to emulate aspects of the native UI to make an attack seem more like a local system event. This possibility also exists with HTML, through the <audio> element.

12. Does this specification expose temporary identifiers to the web?


    No.

13. Does this specification distinguish between behavior in first-party and third-party contexts?


    No.

14. How should this specification work in the context of a user agent’s "incognito" mode?


    Not differently.

15. Does this specification persist data to a user’s local device?


    No.

16. Does this specification have a "Security Considerations" and "Privacy Considerations" section?


    Yes (you are reading it).

17. Does this specification allow downgrading default security characteristics?


    No.

## 9\. Requirements and Use Cases[](https://www.w3.org/TR/webaudio/#requirements)

Please see [\[webaudio-usecases\]](https://www.w3.org/TR/webaudio/#biblio-webaudio-usecases).

## 10\. Common Definitions for Specification Code[](https://www.w3.org/TR/webaudio/#common-definitions)

This section describes common functions and classes employed by JavaScript code used within this specification.

// Three dimensional vector class.class Vec3 { // Construct from 3 coordinates. constructor(x, y, z) { this.x \= x; this.y \= y; this.z \= z; } // Dot product with another vector. dot(v) { return (this.x \* v.x) + (this.y \* v.y) + (this.z \* v.z); } // Cross product with another vector. cross(v) { return new Vec3((this.y \* v.z) \- (this.z \* v.y), (this.z \* v.x) \- (this.x \* v.z), (this.x \* v.y) \- (this.y \* v.x)); } // Difference with another vector. diff(v) { return new Vec3(this.x \- v.x, this.y \- v.y, this.z \- v.z); } // Get the magnitude of this vector. get magnitude() { return Math.sqrt(dot(this)); } // Get a copy of this vector multiplied by a scalar. scale(s) { return new Vec3(this.x \* s, this.y \* s, this.z \* s); } // Get a normalized copy of this vector. normalize() { const m \= magnitude; if (m \== 0) { return new Vec3(0, 0, 0); } return scale(1 / m); }}
