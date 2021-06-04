
# React Audio Components (JS & TSX)

---


## WEB Audio API:

## Introduction

Audio on the web has been fairly primitive up to this point and until very recently has had to be delivered through plugins such as Flash and QuickTime. The introduction of the `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` element in HTML5 is very important, allowing for basic streaming audio playback. But, it is not powerful enough to handle more complex audio applications. For sophisticated web-based games or interactive applications, another solution is required. It is a goal of this specification to include the capabilities found in modern game audio engines as well as some of the mixing, processing, and filtering tasks that are found in modern desktop audio production applications.

The APIs have been designed with a wide variety of use cases [\[webaudio-usecases\]](https://www.w3.org/TR/webaudio/#biblio-webaudio-usecases) in mind. Ideally, it should be able to support _any_ use case which could reasonably be implemented with an optimized C++ engine controlled via script and run in a browser. That said, modern desktop audio software can have very advanced capabilities, some of which would be difficult or impossible to build with this system. Apple’s Logic Audio is one such application which has support for external MIDI controllers, arbitrary plugin audio effects and synthesizers, highly optimized direct-to-disk audio file reading/writing, tightly integrated time-stretching, and so on. Nevertheless, the proposed system will be quite capable of supporting a large range of reasonably complex games and interactive applications, including musical ones. And it can be a very good complement to the more advanced graphics features offered by WebGL. The API has been designed so that more advanced capabilities can be added at a later time.


Web Audio API
=============

Table of Contents
-----------------

1.  [Introduction](https://www.w3.org/TR/webaudio/#introductory)
    1.  [Features](https://www.w3.org/TR/webaudio/#Features)
        1.  [Modular Routing](https://www.w3.org/TR/webaudio/#ModularRouting)

    2.  [API Overview](https://www.w3.org/TR/webaudio/#APIOverview)

2.  [1 The Audio API](https://www.w3.org/TR/webaudio/#audioapi)
    1.  [1.1 The `BaseAudioContext` Interface](https://www.w3.org/TR/webaudio/#BaseAudioContext)
        1.  [1.1.1 Attributes](https://www.w3.org/TR/webaudio/#BaseAudioContext-attributes)
        2.  [1.1.2 Methods](https://www.w3.org/TR/webaudio/#BaseAudioContent-methods)
        3.  [1.1.3 Callback `DecodeSuccessCallback()` Parameters](https://www.w3.org/TR/webaudio/#callback-decodesuccesscallback-parameters)
        4.  [1.1.4 Callback `DecodeErrorCallback()` Parameters](https://www.w3.org/TR/webaudio/#callback-decodeerrorcallback-parameters)
        5.  [1.1.5 Lifetime](https://www.w3.org/TR/webaudio/#lifetime-AudioContext)
        6.  [1.1.6 Lack of Introspection or Serialization Primitives](https://www.w3.org/TR/webaudio/#lack-of-introspection-or-serialization-primitives)
        7.  [1.1.7 System Resources Associated with `BaseAudioContext` Subclasses](https://www.w3.org/TR/webaudio/#system-resources-associated-with-baseaudiocontext-subclasses)

    2.  [1.2 The `AudioContext` Interface](https://www.w3.org/TR/webaudio/#AudioContext)
        1.  [1.2.1 Constructors](https://www.w3.org/TR/webaudio/#AudioContext-constructors)
        2.  [1.2.2 Attributes](https://www.w3.org/TR/webaudio/#AudioContext-attributes)
        3.  [1.2.3 Methods](https://www.w3.org/TR/webaudio/#AudioContext-methods)
        4.  [1.2.4 `AudioContextOptions`](https://www.w3.org/TR/webaudio/#AudioContextOptions)
            1.  [1.2.4.1 Dictionary `AudioContextOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-audiocontextoptions-members)

        5.  [1.2.5 `AudioTimestamp`](https://www.w3.org/TR/webaudio/#AudioTimestamp)
            1.  [1.2.5.1 Dictionary `AudioTimestamp` Members](https://www.w3.org/TR/webaudio/#dictionary-audiotimestamp-members)

    3.  [1.3 The `OfflineAudioContext` Interface](https://www.w3.org/TR/webaudio/#OfflineAudioContext)
        1.  [1.3.1 Constructors](https://www.w3.org/TR/webaudio/#OfflineAudioContext-constructors)
        2.  [1.3.2 Attributes](https://www.w3.org/TR/webaudio/#OfflineAudioContext-attributes)
        3.  [1.3.3 Methods](https://www.w3.org/TR/webaudio/#OfflineAudioContext-methods)
        4.  [1.3.4 `OfflineAudioContextOptions`](https://www.w3.org/TR/webaudio/#OfflineAudioContextOptions)
            1.  [1.3.4.1 Dictionary `OfflineAudioContextOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-offlineaudiocontextoptions-members)

        5.  [1.3.5 The `OfflineAudioCompletionEvent` Interface](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEvent)
            1.  [1.3.5.1 Attributes](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEvent-attributes)
            2.  [1.3.5.2 `OfflineAudioCompletionEventInit`](https://www.w3.org/TR/webaudio/#OfflineAudioCompletionEventInit)
                1.  [1.3.5.2.1 Dictionary `OfflineAudioCompletionEventInit` Members](https://www.w3.org/TR/webaudio/#dictionary-offlineaudiocompletioneventinit-members)

    4.  [1.4 The `AudioBuffer` Interface](https://www.w3.org/TR/webaudio/#AudioBuffer)
        1.  [1.4.1 Constructors](https://www.w3.org/TR/webaudio/#AudioBuffer-constructors)
        2.  [1.4.2 Attributes](https://www.w3.org/TR/webaudio/#AudioBuffer-attributes)
        3.  [1.4.3 Methods](https://www.w3.org/TR/webaudio/#AudioBuffer-methods)
        4.  [1.4.4 `AudioBufferOptions`](https://www.w3.org/TR/webaudio/#AudioBufferOptions)
            1.  [1.4.4.1 Dictionary `AudioBufferOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-audiobufferoptions-members)

    5.  [1.5 The `AudioNode` Interface](https://www.w3.org/TR/webaudio/#AudioNode)
        1.  [1.5.1 AudioNode Creation](https://www.w3.org/TR/webaudio/#AudioNode-creation)
        2.  [1.5.2 AudioNode Tail-Time](https://www.w3.org/TR/webaudio/#AudioNode-tail)
        3.  [1.5.3 AudioNode Lifetime](https://www.w3.org/TR/webaudio/#AudioNode-actively-processing)
        4.  [1.5.4 Attributes](https://www.w3.org/TR/webaudio/#AudioNode-attributes)
        5.  [1.5.5 Methods](https://www.w3.org/TR/webaudio/#AudioNode-methods)
        6.  [1.5.6 `AudioNodeOptions`](https://www.w3.org/TR/webaudio/#AudioNodeOptions)
            1.  [1.5.6.1 Dictionary `AudioNodeOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-audionodeoptions-members)

    6.  [1.6 The `AudioParam` Interface](https://www.w3.org/TR/webaudio/#AudioParam)
        1.  [1.6.1 Attributes](https://www.w3.org/TR/webaudio/#AudioParam-attributes)
        2.  [1.6.2 Methods](https://www.w3.org/TR/webaudio/#AudioParam-methods)
        3.  [1.6.3 Computation of Value](https://www.w3.org/TR/webaudio/#computation-of-value)
        4.  [1.6.4 `AudioParam` Automation Example](https://www.w3.org/TR/webaudio/#example1-AudioParam)

    7.  [1.7 The `AudioScheduledSourceNode` Interface](https://www.w3.org/TR/webaudio/#AudioScheduledSourceNode)
        1.  [1.7.1 Attributes](https://www.w3.org/TR/webaudio/#AudioScheduledSourceNode-attributes)
        2.  [1.7.2 Methods](https://www.w3.org/TR/webaudio/#AudioScheduledSourceNode-methods)

    8.  [1.8 The `AnalyserNode` Interface](https://www.w3.org/TR/webaudio/#AnalyserNode)
        1.  [1.8.1 Constructors](https://www.w3.org/TR/webaudio/#AnalyserNode-constructors)
        2.  [1.8.2 Attributes](https://www.w3.org/TR/webaudio/#AnalyserNode-attributes)
        3.  [1.8.3 Methods](https://www.w3.org/TR/webaudio/#AnalyserNode-methods)
        4.  [1.8.4 `AnalyserOptions`](https://www.w3.org/TR/webaudio/#AnalyserOptions)
            1.  [1.8.4.1 Dictionary `AnalyserOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-analyseroptions-members)

        5.  [1.8.5 Time-Domain Down-Mixing](https://www.w3.org/TR/webaudio/#time-domain-down-mixing)
        6.  [1.8.6 FFT Windowing and Smoothing over Time](https://www.w3.org/TR/webaudio/#fft-windowing-and-smoothing-over-time)

    9.  [1.9 The `AudioBufferSourceNode` Interface](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode)
        1.  [1.9.1 Constructors](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode-constructors)
        2.  [1.9.2 Attributes](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode-attributes)
        3.  [1.9.3 Methods](https://www.w3.org/TR/webaudio/#AudioBufferSourceNode-methods)
        4.  [1.9.4 `AudioBufferSourceOptions`](https://www.w3.org/TR/webaudio/#AudioBufferSourceOptions)
            1.  [1.9.4.1 Dictionary `AudioBufferSourceOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-audiobuffersourceoptions-members)

        5.  [1.9.5 Looping](https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode)
        6.  [1.9.6 Playback of AudioBuffer Contents](https://www.w3.org/TR/webaudio/#playback-AudioBufferSourceNode)

    10. [1.10 The `AudioDestinationNode` Interface](https://www.w3.org/TR/webaudio/#AudioDestinationNode)
        1.  [1.10.1 Attributes](https://www.w3.org/TR/webaudio/#AudioDestinationNode-attributes)

    11. [1.11 The `AudioListener` Interface](https://www.w3.org/TR/webaudio/#AudioListener)
        1.  [1.11.1 Attributes](https://www.w3.org/TR/webaudio/#AudioListener-attributes)
        2.  [1.11.2 Methods](https://www.w3.org/TR/webaudio/#AudioListener-methods)
        3.  [1.11.3 Processing](https://www.w3.org/TR/webaudio/#listenerprocessing)

    12. [1.12 The `AudioProcessingEvent` Interface - DEPRECATED](https://www.w3.org/TR/webaudio/#AudioProcessingEvent)
        1.  [1.12.1 Attributes](https://www.w3.org/TR/webaudio/#AudioProcessingEvent-attributes)
        2.  [1.12.2 `AudioProcessingEventInit`](https://www.w3.org/TR/webaudio/#AudioProcessingEventInit)
            1.  [1.12.2.1 Dictionary `AudioProcessingEventInit` Members](https://www.w3.org/TR/webaudio/#dictionary-audioprocessingeventinit-members)

    13. [1.13 The `BiquadFilterNode` Interface](https://www.w3.org/TR/webaudio/#BiquadFilterNode)
        1.  [1.13.1 Constructors](https://www.w3.org/TR/webaudio/#BiquadFilterNode-constructors)
        2.  [1.13.2 Attributes](https://www.w3.org/TR/webaudio/#BiquadFilterNode-attributes)
        3.  [1.13.3 Methods](https://www.w3.org/TR/webaudio/#BiquadFilterNode-methods)
        4.  [1.13.4 `BiquadFilterOptions`](https://www.w3.org/TR/webaudio/#BiquadFilterOptions)
            1.  [1.13.4.1 Dictionary `BiquadFilterOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-biquadfilteroptions-members)

        5.  [1.13.5 Filters Characteristics](https://www.w3.org/TR/webaudio/#filters-characteristics)

    14. [1.14 The `ChannelMergerNode` Interface](https://www.w3.org/TR/webaudio/#ChannelMergerNode)
        1.  [1.14.1 Constructors](https://www.w3.org/TR/webaudio/#ChannelMergerNode-constructors)
        2.  [1.14.2 `ChannelMergerOptions`](https://www.w3.org/TR/webaudio/#ChannelMergerOptions)
            1.  [1.14.2.1 Dictionary `ChannelMergerOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-channelmergeroptions-members)

    15. [1.15 The `ChannelSplitterNode` Interface](https://www.w3.org/TR/webaudio/#ChannelSplitterNode)
        1.  [1.15.1 Constructors](https://www.w3.org/TR/webaudio/#ChannelSplitterNode-constructors)
        2.  [1.15.2 `ChannelSplitterOptions`](https://www.w3.org/TR/webaudio/#ChannelSplitterOptions)
            1.  [1.15.2.1 Dictionary `ChannelSplitterOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-channelsplitteroptions-members)

    16. [1.16 The `ConstantSourceNode` Interface](https://www.w3.org/TR/webaudio/#ConstantSourceNode)
        1.  [1.16.1 Constructors](https://www.w3.org/TR/webaudio/#ConstantSourceNode-constructors)
        2.  [1.16.2 Attributes](https://www.w3.org/TR/webaudio/#ConstantSourceNode-attributes)
        3.  [1.16.3 `ConstantSourceOptions`](https://www.w3.org/TR/webaudio/#ConstantSourceOptions)
            1.  [1.16.3.1 Dictionary `ConstantSourceOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-constantsourceoptions-members)

    17. [1.17 The `ConvolverNode` Interface](https://www.w3.org/TR/webaudio/#ConvolverNode)
        1.  [1.17.1 Constructors](https://www.w3.org/TR/webaudio/#ConvolverNode-constructors)
        2.  [1.17.2 Attributes](https://www.w3.org/TR/webaudio/#ConvolverNode-attributes)
        3.  [1.17.3 `ConvolverOptions`](https://www.w3.org/TR/webaudio/#ConvolverOptions)
            1.  [1.17.3.1 Dictionary `ConvolverOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-convolveroptions-members)

        4.  [1.17.4 Channel Configurations for Input, Impulse Response and Output](https://www.w3.org/TR/webaudio/#Convolution-channel-configurations)

    18. [1.18 The `DelayNode` Interface](https://www.w3.org/TR/webaudio/#DelayNode)
        1.  [1.18.1 Constructors](https://www.w3.org/TR/webaudio/#DelayNode-constructors)
        2.  [1.18.2 Attributes](https://www.w3.org/TR/webaudio/#DelayNode-attributes)
        3.  [1.18.3 `DelayOptions`](https://www.w3.org/TR/webaudio/#DelayOptions)
            1.  [1.18.3.1 Dictionary `DelayOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-delayoptions-members)

        4.  [1.18.4 Processing](https://www.w3.org/TR/webaudio/#DelayNode-processing)

    19. [1.19 The `DynamicsCompressorNode` Interface](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode)
        1.  [1.19.1 Constructors](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode-constructors)
        2.  [1.19.2 Attributes](https://www.w3.org/TR/webaudio/#DynamicsCompressorNode-attributes)
        3.  [1.19.3 `DynamicsCompressorOptions`](https://www.w3.org/TR/webaudio/#DynamicsCompressorOptions)
            1.  [1.19.3.1 Dictionary `DynamicsCompressorOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-dynamicscompressoroptions-members)

        4.  [1.19.4 Processing](https://www.w3.org/TR/webaudio/#DynamicsCompressorOptions-processing)

    20. [1.20 The `GainNode` Interface](https://www.w3.org/TR/webaudio/#GainNode)
        1.  [1.20.1 Constructors](https://www.w3.org/TR/webaudio/#GainNode-constructors)
        2.  [1.20.2 Attributes](https://www.w3.org/TR/webaudio/#GainNode-attributes)
        3.  [1.20.3 `GainOptions`](https://www.w3.org/TR/webaudio/#GainOptions)
            1.  [1.20.3.1 Dictionary `GainOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-gainoptions-members)

    21. [1.21 The `IIRFilterNode` Interface](https://www.w3.org/TR/webaudio/#IIRFilterNode)
        1.  [1.21.1 Constructors](https://www.w3.org/TR/webaudio/#IIRFilterNode-constructors)
        2.  [1.21.2 Methods](https://www.w3.org/TR/webaudio/#IIRFilterNode-methods)
        3.  [1.21.3 `IIRFilterOptions`](https://www.w3.org/TR/webaudio/#IIRFilterOptions)
            1.  [1.21.3.1 Dictionary `IIRFilterOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-iirfilteroptions-members)

        4.  [1.21.4 Filter Definition](https://www.w3.org/TR/webaudio/#IIRFilterNode-filter-definition)

    22. [1.22 The `MediaElementAudioSourceNode` Interface](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode)
        1.  [1.22.1 Constructors](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode-constructors)
        2.  [1.22.2 Attributes](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceNode-attributes)
        3.  [1.22.3 `MediaElementAudioSourceOptions`](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceOptions)
            1.  [1.22.3.1 Dictionary `MediaElementAudioSourceOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-mediaelementaudiosourceoptions-members)

        4.  [1.22.4 Security with MediaElementAudioSourceNode and Cross-Origin Resources](https://www.w3.org/TR/webaudio/#MediaElementAudioSourceOptions-security)

    23. [1.23 The `MediaStreamAudioDestinationNode` Interface](https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode)
        1.  [1.23.1 Constructors](https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode-constructors)
        2.  [1.23.2 Attributes](https://www.w3.org/TR/webaudio/#MediaStreamAudioDestinationNode-attributes)

    24. [1.24 The `MediaStreamAudioSourceNode` Interface](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode)
        1.  [1.24.1 Constructors](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode-constructors)
        2.  [1.24.2 Attributes](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceNode-attributes)
        3.  [1.24.3 `MediaStreamAudioSourceOptions`](https://www.w3.org/TR/webaudio/#MediaStreamAudioSourceOptions)
            1.  [1.24.3.1 Dictionary `MediaStreamAudioSourceOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-mediastreamaudiosourceoptions-members)

    25. [1.25 The `MediaStreamTrackAudioSourceNode` Interface](https://www.w3.org/TR/webaudio/#MediaStreamTrackAudioSourceNode)
        1.  [1.25.1 Constructors](https://www.w3.org/TR/webaudio/#MediaStreamTrackAudioSourceNode-constructors)
        2.  [1.25.2 `MediaStreamTrackAudioSourceOptions`](https://www.w3.org/TR/webaudio/#MediaStreamTrackAudioSourceOptions)
            1.  [1.25.2.1 Dictionary `MediaStreamTrackAudioSourceOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-mediastreamtrackaudiosourceoptions-members)

    26. [1.26 The `OscillatorNode` Interface](https://www.w3.org/TR/webaudio/#OscillatorNode)
        1.  [1.26.1 Constructors](https://www.w3.org/TR/webaudio/#OscillatorNode-constructors)
        2.  [1.26.2 Attributes](https://www.w3.org/TR/webaudio/#OscillatorNode-attributes)
        3.  [1.26.3 Methods](https://www.w3.org/TR/webaudio/#OscillatorNode-methods)
        4.  [1.26.4 `OscillatorOptions`](https://www.w3.org/TR/webaudio/#OscillatorOptions)
            1.  [1.26.4.1 Dictionary `OscillatorOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-oscillatoroptions-members)

        5.  [1.26.5 Basic Waveform Phase](https://www.w3.org/TR/webaudio/#basic-waveform-phase)

    27. [1.27 The `PannerNode` Interface](https://www.w3.org/TR/webaudio/#PannerNode)
        1.  [1.27.1 Constructors](https://www.w3.org/TR/webaudio/#PannerNode-constructors)
        2.  [1.27.2 Attributes](https://www.w3.org/TR/webaudio/#PannerNode-attributes)
        3.  [1.27.3 Methods](https://www.w3.org/TR/webaudio/#PannerNode-methods)
        4.  [1.27.4 `PannerOptions`](https://www.w3.org/TR/webaudio/#PannerOptions)
            1.  [1.27.4.1 Dictionary `PannerOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-pannernode-members)

        5.  [1.27.5 Channel Limitations](https://www.w3.org/TR/webaudio/#panner-channel-limitations)

    28. [1.28 The `PeriodicWave` Interface](https://www.w3.org/TR/webaudio/#PeriodicWave)
        1.  [1.28.1 Constructors](https://www.w3.org/TR/webaudio/#PeriodicWave-constructors)
        2.  [1.28.2 `PeriodicWaveConstraints`](https://www.w3.org/TR/webaudio/#PeriodicWaveConstraints)
            1.  [1.28.2.1 Dictionary `PeriodicWaveConstraints` Members](https://www.w3.org/TR/webaudio/#dictionary-periodicwaveconstraints-members)

        3.  [1.28.3 `PeriodicWaveOptions`](https://www.w3.org/TR/webaudio/#PeriodicWaveOptions)
            1.  [1.28.3.1 Dictionary `PeriodicWaveOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-periodicwaveoptions-members)

        4.  [1.28.4 Waveform Generation](https://www.w3.org/TR/webaudio/#waveform-generation)
        5.  [1.28.5 Waveform Normalization](https://www.w3.org/TR/webaudio/#waveform-normalization)
        6.  [1.28.6 Oscillator Coefficients](https://www.w3.org/TR/webaudio/#oscillator-coefficients)

    29. [1.29 The `ScriptProcessorNode` Interface - DEPRECATED](https://www.w3.org/TR/webaudio/#ScriptProcessorNode)
        1.  [1.29.1 Attributes](https://www.w3.org/TR/webaudio/#ScriptProcessorNode-attributes)

    30. [1.30 The `StereoPannerNode` Interface](https://www.w3.org/TR/webaudio/#StereoPannerNode)
        1.  [1.30.1 Constructors](https://www.w3.org/TR/webaudio/#StereoPannerNode-constructors)
        2.  [1.30.2 Attributes](https://www.w3.org/TR/webaudio/#StereoPannerNode-attributes)
        3.  [1.30.3 `StereoPannerOptions`](https://www.w3.org/TR/webaudio/#StereoPannerOptions)
            1.  [1.30.3.1 Dictionary `StereoPannerOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-stereopanneroptions-members)

        4.  [1.30.4 Channel Limitations](https://www.w3.org/TR/webaudio/#StereoPanner-channel-limitations)

    31. [1.31 The `WaveShaperNode` Interface](https://www.w3.org/TR/webaudio/#WaveShaperNode)
        1.  [1.31.1 Constructors](https://www.w3.org/TR/webaudio/#WaveShaperNode-constructors)
        2.  [1.31.2 Attributes](https://www.w3.org/TR/webaudio/#WaveShaperNode-attributes)
        3.  [1.31.3 `WaveShaperOptions`](https://www.w3.org/TR/webaudio/#WaveShaperOptions)
            1.  [1.31.3.1 Dictionary `WaveShaperOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-waveshaperoptions-members)

    32. [1.32 The `AudioWorklet` Interface](https://www.w3.org/TR/webaudio/#AudioWorklet)
        1.  [1.32.1 Concepts](https://www.w3.org/TR/webaudio/#AudioWorklet-concepts)
        2.  [1.32.2 The `AudioWorkletGlobalScope` Interface](https://www.w3.org/TR/webaudio/#AudioWorkletGlobalScope)
            1.  [1.32.2.1 Attributes](https://www.w3.org/TR/webaudio/#AudioWorkletGlobalScope-attributes)
            2.  [1.32.2.2 Methods](https://www.w3.org/TR/webaudio/#AudioWorkletGlobalScope-methods)
            3.  [1.32.2.3 The instantiation of `AudioWorkletProcessor`](https://www.w3.org/TR/webaudio/#AudioWorkletProcessor-instantiation)

        3.  [1.32.3 The `AudioWorkletNode` Interface](https://www.w3.org/TR/webaudio/#AudioWorkletNode)
            1.  [1.32.3.1 Constructors](https://www.w3.org/TR/webaudio/#AudioWorkletNode-constructors)
            2.  [1.32.3.2 Attributes](https://www.w3.org/TR/webaudio/#AudioWorkletNode-attributes)
            3.  [1.32.3.3 `AudioWorkletNodeOptions`](https://www.w3.org/TR/webaudio/#AudioWorkletNodeOptions)
                1.  [1.32.3.3.1 Dictionary `AudioWorkletNodeOptions` Members](https://www.w3.org/TR/webaudio/#dictionary-audioworkletnodeoptions-members)
                2.  [1.32.3.3.2 Configuring Channels with `AudioWorkletNodeOptions`](https://www.w3.org/TR/webaudio/#configuring-channels-with-audioworkletnodeoptions)

        4.  [1.32.4 The `AudioWorkletProcessor` Interface](https://www.w3.org/TR/webaudio/#AudioWorkletProcessor)
            1.  [1.32.4.1 Constructors](https://www.w3.org/TR/webaudio/#AudioWorketProcessor-constructors)
            2.  [1.32.4.2 Attributes](https://www.w3.org/TR/webaudio/#AudioWorkletProcessor-attributes)
            3.  [1.32.4.3 Callback `AudioWorkletProcessCallback`](https://www.w3.org/TR/webaudio/#callback-audioworketprocess-callback)
                1.  [1.32.4.3.1 Callback `AudioWorkletProcessCallback` Parameters](https://www.w3.org/TR/webaudio/#audioworkletprocess-callback-parameters)

            4.  [1.32.4.4 `AudioParamDescriptor`](https://www.w3.org/TR/webaudio/#AudioParamDescriptor)
                1.  [1.32.4.4.1 Dictionary `AudioParamDescriptor` Members](https://www.w3.org/TR/webaudio/#dictionary-audioparamdescriptor-members)

        5.  [1.32.5 AudioWorklet Sequence of Events](https://www.w3.org/TR/webaudio/#AudioWorklet-Sequence)
        6.  [1.32.6 AudioWorklet Examples](https://www.w3.org/TR/webaudio/#AudioWorklet-Examples)
            1.  [1.32.6.1 The BitCrusher Node](https://www.w3.org/TR/webaudio/#the-bitcrusher-node)
            2.  [1.32.6.2 VU Meter Node](https://www.w3.org/TR/webaudio/#vu-meter-mode)

3.  [2 Processing model](https://www.w3.org/TR/webaudio/#processing-model)
    1.  [2.1 Background](https://www.w3.org/TR/webaudio/#processing-model-background)
    2.  [2.2 Control Thread and Rendering Thread](https://www.w3.org/TR/webaudio/#control-thread-and-rendering-thread)
    3.  [2.3 Asynchronous Operations](https://www.w3.org/TR/webaudio/#asynchronous-operations)
    4.  [2.4 Rendering an Audio Graph](https://www.w3.org/TR/webaudio/#rendering-loop)
    5.  [2.5 Unloading a document](https://www.w3.org/TR/webaudio/#unloading-a-document)

4.  [3 Dynamic Lifetime](https://www.w3.org/TR/webaudio/#DynamicLifetime)
    1.  [3.1 Background](https://www.w3.org/TR/webaudio/#dynamic-lifetime-background)
    2.  [3.2 Example](https://www.w3.org/TR/webaudio/#dynamic-lifetime-example)

5.  [4 Channel Up-Mixing and Down-Mixing](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing)
    1.  [4.1 Speaker Channel Layouts](https://www.w3.org/TR/webaudio/#ChannelLayouts)
    2.  [4.2 Channel Ordering](https://www.w3.org/TR/webaudio/#ChannelOrdering)
    3.  [4.3 Implication of tail-time on input and output channel count](https://www.w3.org/TR/webaudio/#channels-tail-time)
    4.  [4.4 Up Mixing Speaker Layouts](https://www.w3.org/TR/webaudio/#UpMix-sub)
    5.  [4.5 Down Mixing Speaker Layouts](https://www.w3.org/TR/webaudio/#down-mix)
    6.  [4.6 Channel Rules Examples](https://www.w3.org/TR/webaudio/#ChannelRules-section)

6.  [5 Audio Signal Values](https://www.w3.org/TR/webaudio/#audio-signal-values)
    1.  [5.1 Audio sample format](https://www.w3.org/TR/webaudio/#audio-sample-format)
    2.  [5.2 Rendering](https://www.w3.org/TR/webaudio/#audio-values-rendering)

7.  [6 Spatialization/Panning](https://www.w3.org/TR/webaudio/#Spatialization)
    1.  [6.1 Background](https://www.w3.org/TR/webaudio/#Spatialization-background)
    2.  [6.2 Azimuth and Elevation](https://www.w3.org/TR/webaudio/#azimuth-elevation)
    3.  [6.3 Panning Algorithm](https://www.w3.org/TR/webaudio/#Spatialization-panning-algorithm)
        1.  [6.3.1 PannerNode "equalpower" Panning](https://www.w3.org/TR/webaudio/#Spatialization-equal-power-panning)
        2.  [6.3.2 PannerNode "HRTF" Panning (Stereo Only)](https://www.w3.org/TR/webaudio/#Spatialization-hrtf-panning)
        3.  [6.3.3 StereoPannerNode Panning](https://www.w3.org/TR/webaudio/#stereopanner-algorithm)

    4.  [6.4 Distance Effects](https://www.w3.org/TR/webaudio/#Spatialization-distance-effects)
    5.  [6.5 Sound Cones](https://www.w3.org/TR/webaudio/#Spatialization-sound-cones)

8.  [7 Performance Considerations](https://www.w3.org/TR/webaudio/#Performance)
    1.  [7.1 Latency](https://www.w3.org/TR/webaudio/#latency)
    2.  [7.2 Audio Buffer Copying](https://www.w3.org/TR/webaudio/#audio-buffer-copying)
    3.  [7.3 AudioParam Transitions](https://www.w3.org/TR/webaudio/#audioparam-transitions)
    4.  [7.4 Audio Glitching](https://www.w3.org/TR/webaudio/#audio-glitching)

9.  [8 Security and Privacy Considerations](https://www.w3.org/TR/webaudio/#priv-sec)
10. [9 Requirements and Use Cases](https://www.w3.org/TR/webaudio/#requirements)
11. [10 Common Definitions for Specification Code](https://www.w3.org/TR/webaudio/#common-definitions)
12. [11 Change Log](https://www.w3.org/TR/webaudio/#changes)
    1.  [11.1 Since Candidate Recommendation of 14 January 2021](https://www.w3.org/TR/webaudio/#changes-2021-01-14)
    2.  [11.2 Since Candidate Recommendation of 11 June 2020](https://www.w3.org/TR/webaudio/#changes-2020-06-11)
    3.  [11.3 Since Candidate Recommendation of 18 September 2018](https://www.w3.org/TR/webaudio/#changestart1)
    4.  [11.4 Since Working Draft of 19 June 2018](https://www.w3.org/TR/webaudio/#changestart2)
    5.  [11.5 Since Working Draft of 08 December 2015](https://www.w3.org/TR/webaudio/#changestart3)

13. [12 Acknowledgements](https://www.w3.org/TR/webaudio/#acks)
14. [Conformance](https://www.w3.org/TR/webaudio/#conformance)
    1.  [Document conventions](https://www.w3.org/TR/webaudio/#conventions)
    2.  [Conformant Algorithms](https://www.w3.org/TR/webaudio/#conformant-algorithms)
    3.  [Conformance Classes](https://www.w3.org/TR/webaudio/#conformance-classes)

15. [Index](https://www.w3.org/TR/webaudio/#index)
    1.  [Terms defined by this specification](https://www.w3.org/TR/webaudio/#index-defined-here)
    2.  [Terms defined by reference](https://www.w3.org/TR/webaudio/#index-defined-elsewhere)

16. [References](https://www.w3.org/TR/webaudio/#references)
    1.  [Normative References](https://www.w3.org/TR/webaudio/#normative)
    2.  [Informative References](https://www.w3.org/TR/webaudio/#informative)

17. [IDL Index](https://www.w3.org/TR/webaudio/#idl-index)

Introduction
------------

Audio on the web has been fairly primitive up to this point and until very recently has had to be delivered through plugins such as Flash and QuickTime. The introduction of the `audio` element in HTML5 is very important, allowing for basic streaming audio playback. But, it is not powerful enough to handle more complex audio applications. For sophisticated web-based games or interactive applications, another solution is required. It is a goal of this specification to include the capabilities found in modern game audio engines as well as some of the mixing, processing, and filtering tasks that are found in modern desktop audio production applications.

The APIs have been designed with a wide variety of use cases [[webaudio-usecases]](https://www.w3.org/TR/webaudio/#biblio-webaudio-usecases) in mind. Ideally, it should be able to support *any* use case which could reasonably be implemented with an optimized C++ engine controlled via script and run in a browser. That said, modern desktop audio software can have very advanced capabilities, some of which would be difficult or impossible to build with this system. Apple’s Logic Audio is one such application which has support for external MIDI controllers, arbitrary plugin audio effects and synthesizers, highly optimized direct-to-disk audio file reading/writing, tightly integrated time-stretching, and so on. Nevertheless, the proposed system will be quite capable of supporting a large range of reasonably complex games and interactive applications, including musical ones. And it can be a very good complement to the more advanced graphics features offered by WebGL. The API has been designed so that more advanced capabilities can be added at a later time.

### Features

The API supports these primary features:

-   [Modular routing](https://www.w3.org/TR/webaudio/#ModularRouting) for simple or complex mixing/effect architectures.

-   High dynamic range, using 32-bit floats for internal processing.

-   [Sample-accurate scheduled sound playback](https://www.w3.org/TR/webaudio/#AudioParam) with low [latency](https://www.w3.org/TR/webaudio/#latency) for musical applications requiring a very high degree of rhythmic precision such as drum machines and sequencers. This also includes the possibility of [dynamic creation](https://www.w3.org/TR/webaudio/#DynamicLifetime) of effects.

-   Automation of audio parameters for envelopes, fade-ins / fade-outs, granular effects, filter sweeps, LFOs etc.

-   Flexible handling of channels in an audio stream, allowing them to be split and merged.

-   Processing of audio sources from an `audio` or `video` `media element`.

-   Processing live audio input using a `MediaStream` from `getUserMedia()`.

-   Integration with WebRTC

    -   Processing audio received from a remote peer using a `MediaStreamTrackAudioSourceNode` and [[webrtc]](https://www.w3.org/TR/webaudio/#biblio-webrtc).

    -   Sending a generated or processed audio stream to a remote peer using a `MediaStreamAudioDestinationNode` and [[webrtc]](https://www.w3.org/TR/webaudio/#biblio-webrtc).

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

Modular routing allows arbitrary connections between different `AudioNode` objects. Each node can have inputs and/or outputs. A source node has no inputs and a single output. A destination node has one input and no outputs. Other nodes such as filters can be placed between the source and destination nodes. The developer doesn’t have to worry about low-level stream format details when two objects are connected together; [the right thing just happens](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing). For example, if a mono audio stream is connected to a stereo input it should just mix to left and right channels [appropriately](https://www.w3.org/TR/webaudio/#channel-up-mixing-and-down-mixing).

In the simplest case, a single source can be routed directly to the output. All routing occurs within an `AudioContext` containing a single `AudioDestinationNode`:


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
