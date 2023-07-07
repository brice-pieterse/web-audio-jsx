# web-audio-jsx

A react component for composing audio using the web audio api.

MediaElements are meant for normal playback of media and aren't optimized enough to get low latency. The best is to use the Web Audio API, and AudioBuffers. 

This component allows you to register all the sounds upfront or at some particular state in the application, before providing you with an audioController object that can be used to control playback and volume of the sounds, which may play simultaneously. This object is typically shared with the rest of the app via React Context.

## Props
props.sounds: Array<Sound> : all of the sounds needed for the 
current state of the application

```
Sound = {
    name: String,
    url: String,
    loop: Bool
}  
``` 

## Usage

1. Registering sounds

Construct an array of type Sound which can be passed to the component. The component will reinitialize for every new array passed to it as the sounds props, old sounds will not be persisted.

```
setSounds([
    {
        name: 'ButtonClick',
        url: '/audio/buttonClick.mp3',
        loop: false
    },
    {
        name: 'Ping',
        url: '/audio/ping.mp3',
        loop: false
    },
    {
        name: 'Fireworks',
        url: '/audio/fireworks.mp3',
        loop: false
    }
])
```



2. Controlling sounds

The component will initialize an audioController that can be placed in context for use by other components:

``` 
AudioController = {
    [soundName: String]: GainNode,
    play: () => {},
    stop: () => {},
    crossFade: (Array<{ soundName: String, volume: Number }>) => {},
}
``` 

This object can be used like so:

``` 
appCtx.audioController.play([{ name: 'ButtonClick', volume: 0.25 }])
``` 

If no array is passed, all sounds that were registered via props.sounds will begin playing with a volume of 0:

``` 
appCtx.audioController.play()
``` 

Volume can be adjusted as follows, but only after calling play (which initializes the gainNode for a sound):

``` 
appCtx.audioController['ButtonClick'].gainNode.gain.value += 0.002
``` 

Or by passing an array to the crossFade function with all volumes to update:

``` 
appCtx.audioController.crossFade([{name: 'ButtonClick', volume: 0.25 }])
``` 
