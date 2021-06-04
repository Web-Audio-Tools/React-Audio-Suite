# React Audio Components (JS & TSX)

---

## WEB Audio API:

## Introduction

Audio on the web has been fairly primitive up to this point and until very recently has had to be delivered through plugins such as Flash and QuickTime. The introduction of the `[audio](https://html.spec.whatwg.org/multipage/media.html#audio)` element in HTML5 is very important, allowing for basic streaming audio playback. But, it is not powerful enough to handle more complex audio applications. For sophisticated web-based games or interactive applications, another solution is required. It is a goal of this specification to include the capabilities found in modern game audio engines as well as some of the mixing, processing, and filtering tasks that are found in modern desktop audio production applications.

The APIs have been designed with a wide variety of use cases [\[webaudio-usecases\]](https://www.w3.org/TR/webaudio/#biblio-webaudio-usecases) in mind. Ideally, it should be able to support _any_ use case which could reasonably be implemented with an optimized C++ engine controlled via script and run in a browser. That said, modern desktop audio software can have very advanced capabilities, some of which would be difficult or impossible to build with this system. Apple’s Logic Audio is one such application which has support for external MIDI controllers, arbitrary plugin audio effects and synthesizers, highly optimized direct-to-disk audio file reading/writing, tightly integrated time-stretching, and so on. Nevertheless, the proposed system will be quite capable of supporting a large range of reasonably complex games and interactive applications, including musical ones. And it can be a very good complement to the more advanced graphics features offered by WebGL. The API has been designed so that more advanced capabilities can be added at a later time.

# Using the Web Audio API - Web APIs | MDN

> Great! We have a boombox that plays our 'tape', and we can adjust the volume and stereo panning, giving us a fairly basic working audio graph.

Let's take a look at getting started with the [Web Audio API](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API). We'll briefly look at some concepts, then study a simple boombox example that allows us to load an audio track, play and pause it, and change its volume and stereo panning.

The Web Audio API does not replace the [`<audio>`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/HTML/Element/audio) media element, but rather complements it, just like [`<canvas>`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/HTML/Element/canvas) coexists alongside the [`<img>`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/HTML/Element/img) element. Your use case will determine what tools you use to implement audio. If you want to control playback of an audio track, the `<audio>` media element provides a better, quicker solution than the Web Audio API. If you want to carry out more complex audio processing, as well as playback, the Web Audio API provides much more power and control.

A powerful feature of the Web Audio API is that it does not have a strict "sound call limitation". For example, there is no ceiling of 32 or 64 sound calls at one time. Some processors may be capable of playing more than 1,000 simultaneous sounds without stuttering.

## [Example code](#example_code "Permalink to Example code")

Our boombox looks like this:

![A boombox with play, pan, and volume controls](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API/boombox.png)

Note the retro cassette deck with a play button, and vol and pan sliders to allow you to alter the volume and stereo panning. We could make this a lot more complex, but this is ideal for simple learning at this stage.

[Check out the final demo here on Codepen](https://codepen.io/Rumyra/pen/qyMzqN/), or see the [source code on GitHub](https://github.com/mdn/webaudio-examples/tree/master/audio-basics).

## [Browser support](#browser_support "Permalink to Browser support")

Modern browsers have good support for most features of the Web Audio API. There are a lot of features of the API, so for more exact information, you'll have to check the browser compatibility tables at the bottom of each reference page.

## [Audio graphs](#audio_graphs "Permalink to Audio graphs")

Everything within the Web Audio API is based around the concept of an audio graph, which is made up of nodes.

The Web Audio API handles audio operations inside an **audio context**, and has been designed to allow **modular routing**. Basic audio operations are performed with **audio nodes**, which are linked together to form an **audio routing graph**. You have input nodes, which are the source of the sounds you are manipulating, modification nodes that change those sounds as desired, and output nodes (destinations), which allow you to save or hear those sounds.

Several audio sources with different channel layouts are supported, even within a single context. Because of this modular design, you can create complex audio functions with dynamic effects.

## [Audio context](#audio_context "Permalink to Audio context")

To be able to do anything with the Web Audio API, we need to create an instance of the audio context. This then gives us access to all the features and functionality of the API.

    const AudioContext = window.AudioContext || window.webkitAudioContext;

    const audioContext = new AudioContext();

So what's going on when we do this? A [`BaseAudioContext`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/BaseAudioContext) is created for us automatically and extended to an online audio context. We'll want this because we're looking to play live sound.

**Note**: If you just want to process audio data, for instance, buffer and stream it but not play it, you might want to look into creating an [`OfflineAudioContext`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/OfflineAudioContext).

## [Loading sound](#loading_sound "Permalink to Loading sound")

Now, the audio context we've created needs some sound to play through it. There are a few ways to do this with the API. Let's begin with a simple method — as we have a boombox, we most likely want to play a full song track. Also, for accessibility, it's nice to expose that track in the DOM. We'll expose the song on the page using an [`<audio>`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/HTML/Element/audio) element.

    <audio src="myCoolTrack.mp3"></audio>

**Note**: If the sound file you're loading is held on a different domain you will need to use the `crossorigin` attribute; see [Cross Origin Resource Sharing (CORS)](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/HTTP/CORS) for more information.

To use all the nice things we get with the Web Audio API, we need to grab the source from this element and _pipe_ it into the context we have created. Lucky for us there's a method that allows us to do just that — [`AudioContext.createMediaElementSource`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/AudioContext/createMediaElementSource):

    const audioElement = document.querySelector('audio');


    const track = audioContext.createMediaElementSource(audioElement);

**Note**: The `<audio>` element above is represented in the DOM by an object of type [`HTMLMediaElement`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/HTMLMediaElement), which comes with its own set of functionality. All of this has stayed intact; we are merely allowing the sound to be available to the Web Audio API.

## [Controlling sound](#controlling_sound "Permalink to Controlling sound")

When playing sound on the web, it's important to allow the user to control it. Depending on the use case, there's a myriad of options, but we'll provide functionality to play/pause the sound, alter the track's volume, and pan it from left to right.

Controlling sound programmatically from JavaScript code is covered by browsers' autoplay support policies, as such is likely to be blocked without permission being granted by the user (or a whitelist). Autoplay policies typically require either explicit permission or a user engagement with the page before scripts can trigger audio to play.

These special requirements are in place essentially because unexpected sounds can be annoying and intrusive, and can cause accessibility problems. You can learn more about this in our article [Autoplay guide for media and Web Audio APIs](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/Media/Autoplay_guide).

Since our scripts are playing audio in response to a user input event (a click on a play button, for instance), we're in good shape and should have no problems from autoplay blocking. So, let's start by taking a look at our play and pause functionality. We have a play button that changes to a pause button when the track is playing:

    <button data-playing="false" role="switch" aria-checked="false">
        <span>Play/Pause</span>
    </button>

Before we can play our track we need to connect our audio graph from the audio source/input node to the destination.

We've already created an input node by passing our audio element into the API. For the most part, you don't need to create an output node, you can just connect your other nodes to [`BaseAudioContext.destination`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/BaseAudioContext/destination), which handles the situation for you:

    track.connect(audioContext.destination);

A good way to visualise these nodes is by drawing an audio graph so you can visualize it. This is what our current audio graph looks like:

![an audio graph with an audio element source connected to the default destination](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API/graph1.jpg)

Now we can add the play and pause functionality.

    const playButton = document.querySelector('button');

    playButton.addEventListener('click', function() {


        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }


        if (this.dataset.playing === 'false') {
            audioElement.play();
            this.dataset.playing = 'true';
        } else if (this.dataset.playing === 'true') {
            audioElement.pause();
            this.dataset.playing = 'false';
        }

    }, false);

We also need to take into account what to do when the track finishes playing. Our `HTMLMediaElement` fires an `ended` event once it's finished playing, so we can listen for that and run code accordingly:

    audioElement.addEventListener('ended', () => {
        playButton.dataset.playing = 'false';
    }, false);

## [Modifying sound](#modifying_sound "Permalink to Modifying sound")

Let's delve into some basic modification nodes, to change the sound that we have. This is where the Web Audio API really starts to come in handy. First of all, let's change the volume. This can be done using a [`GainNode`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/GainNode), which represents how big our sound wave is.

There are two ways you can create nodes with the Web Audio API. You can use the factory method on the context itself (e.g. `audioContext.createGain()`) or via a constructor of the node (e.g. `new GainNode()`). We'll use the factory method in our code:

    const gainNode = audioContext.createGain();

Now we have to update our audio graph from before, so the input is connected to the gain, then the gain node is connected to the destination:

    track.connect(gainNode).connect(audioContext.destination);

This will make our audio graph look like this:

![an audio graph with an audio element source, connected to a gain node that modifies the audio source, and then going to the default destination](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API/graph2.jpg)

The default value for gain is 1; this keeps the current volume the same. Gain can be set to a minimum of about -3.4 and a max of about 3.4. Here we'll allow the boombox to move the gain up to 2 (double the original volume) and down to 0 (this will effectively mute our sound).

Let's give the user control to do this — we'll use a [range input](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/HTML/Element/input/range):

    <input type="range" id="volume" min="0" max="2" value="1" step="0.01">

**Note**: Range inputs are a really handy input type for updating values on audio nodes. You can specify a range's values and use them directly with the audio node's parameters.

So let's grab this input's value and update the gain value when the input node has its value changed by the user:

    const volumeControl = document.querySelector('#volume');

    volumeControl.addEventListener('input', function() {
        gainNode.gain.value = this.value;
    }, false);

**Note**: The values of node objects (e.g. `GainNode.gain`) are not simple values; they are actually objects of type [`AudioParam`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/AudioParam) — these called parameters. This is why we have to set `GainNode.gain`'s `value` property, rather than just setting the value on `gain` directly. This enables them to be much more flexible, allowing for passing the parameter a specific set of values to change between over a set period of time, for example.

Great, now the user can update the track's volume! The gain node is the perfect node to use if you want to add mute functionality.

## [Adding stereo panning to our app](#adding_stereo_panning_to_our_app "Permalink to Adding stereo panning to our app")

Let's add another modification node to practice what we've just learnt.

There's a [`StereoPannerNode`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/StereoPannerNode) node, which changes the balance of the sound between the left and right speakers, if the user has stereo capabilities.

**Note**: The `StereoPannerNode` is for simple cases in which you just want stereo panning from left to right. There is also a [`PannerNode`](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/PannerNode), which allows for a great deal of control over 3D space, or sound _spatialisation_, for creating more complex effects. This is used in games and 3D apps to create birds flying overhead, or sound coming from behind the user for instance.

To visualise it, we will be making our audio graph look like this:

![An image showing the audio graph showing an input node, two modification nodes (a gain node and a stereo panner node) and a destination node.](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API/graphpan.jpg)

Let's use the constructor method of creating a node this time. When we do it this way, we have to pass in the context and any options that the particular node may take:

    const pannerOptions = { pan: 0 };
    const panner = new StereoPannerNode(audioContext, pannerOptions);

**Note**: The constructor method of creating nodes is not supported by all browsers at this time. The older factory methods are supported more widely.

Here our values range from -1 (far left) and 1 (far right). Again let's use a range type input to vary this parameter:

    <input type="range" id="panner" min="-1" max="1" value="0" step="0.01">

We use the values from that input to adjust our panner values in the same way as we did before:

    const pannerControl = document.querySelector('#panner');

    pannerControl.addEventListener('input', function() {
        panner.pan.value = this.value;
    }, false);

Let's adjust our audio graph again, to connect all the nodes together:

    track.connect(gainNode).connect(panner).connect(audioContext.destination);

The only thing left to do is give the app a try: [Check out the final demo here on Codepen](https://codepen.io/Rumyra/pen/qyMzqN/).

## [Summary](#summary "Permalink to Summary")

Great! We have a boombox that plays our 'tape', and we can adjust the volume and stereo panning, giving us a fairly basic working audio graph.

This makes up quite a few basics that you would need to start to add audio to your website or web app. There's a lot more functionality to the Web Audio API, but once you've grasped the concept of nodes and putting your audio graph together, we can move on to looking at more complex functionality.

## [More examples](#more_examples "Permalink to More examples")

There are other examples available to learn more about the Web Audio API.

The [Voice-change-O-matic](https://github.com/mdn/voice-change-o-matic) is a fun voice manipulator and sound visualization web app that allows you to choose different effects and visualizations. The application is fairly rudimentary, but it demonstrates the simultaneous use of multiple Web Audio API features. ([run the Voice-change-O-matic live](https://mdn.github.io/voice-change-o-matic/)).

![A UI with a sound wave being shown, and options for choosing voice effects and visualizations.](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API/voice-change-o-matic.png)

Another application developed specifically to demonstrate the Web Audio API is the [Violent Theremin](https://mdn.github.io/violent-theremin/), a simple web application that allows you to change pitch and volume by moving your mouse pointer. It also provides a psychedelic lightshow ([see Violent Theremin source code](https://github.com/mdn/violent-theremin)).

![A page full of rainbow colors, with two buttons labeled Clear screen and mute.](chrome-extension://cjedbglnccaioiolemnfhjncicchinao/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API/violent-theremin.png)

Also see our [webaudio-examples repo](https://github.com/mdn/webaudio-examples) for more examples.

[Source](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API)

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
