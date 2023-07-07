import React from 'react'
import { AppContext } from '../../../context/provider'

export default function SoundController(props){
    let appContext = React.useContext(AppContext)
    let soundBuffer = React.useRef()
    let context = React.useRef()

    // fetches the sound(s) we need, contructs an object that we can use to play/stop the sound(s) as well as crossfade them
    React.useEffect(() => {

        let init = async () => {
            soundBuffer.current = []
            context.current = new AudioContext()
            let audioController = {}
    
            let fetchSound = async (sound) => {
                try {
                    let res = await fetch(sound.url, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/octet-stream'
                        }
                    })
    
                    if (!res.ok) {
                        throw new Error('Network response was not OK');
                    }
                    
                    let buffer = await res.arrayBuffer();
                    let audioBuffer = await context.current.decodeAudioData(buffer)
                    soundBuffer.current.push({ name: sound.name, loop: sound.loop, buffer: audioBuffer })
                }
                catch(e){
                    console.error('Error:', e);
                }
            }
    
            for (let sound of props.sounds){
                await fetchSound(sound) 
            }
    
            audioController.play = (these = null) => {
                
                if(these){
                    for (let sound of these){
                        let soundData = soundBuffer.current.find(s => s.name == sound.name)
                        initSound(soundData, sound.volume)
                    }
                } 
                // plays all sounds in the soundbuffer starting with them all at volume of 0
                else {
                    for (let sound of soundBuffer.current){
                        initSound(sound)
                    }
                }

                // checks if we already have a source for this sound in soundbuffer, if not creates it and stores it to reuse later
                function initSound(sound, initVolume = 0){

                    // if a source already exists for this sound, kill it before replacing it
                    if(sound.source){
                        sound.source.stop(0);
                        sound.source.disconnect();
                    }

                    let sourceData = createSource(sound.buffer, context.current, sound.loop)
                    sound.source = sourceData.source
                    audioController[sound.name] = sourceData
                    audioController[sound.name].gainNode.gain.value = initVolume;
                    audioController[sound.name].source.start(0);
                }
        
                function createSource(buffer, context, loop = false) {
                    var source = context.createBufferSource();
                    var gainNode = context.createGain ? context.createGain() : context.createGainNode();
                    source.buffer = buffer;
                    source.loop = loop;
                    // Connect source to gain.
                    source.connect(gainNode);
                    // Connect gain to destination.
                    gainNode.connect(context.destination);
        
                    return {
                        source: source,
                        gainNode: gainNode
                    };
                }
            }
    
            audioController.stop = () => {
                for (let sound of soundBuffer.current){
                    if (audioController[sound.name]){
                        audioController[sound.name].source.stop(0);
                        audioController[sound.name].source.disconnect();
                    }
                }
            }
    
            audioController.crossFade = (volumes) => {
                // sounds will be an object with all the current keys in audioController along with a volume
                for (let sound of volumes){
                    if(audioController[sound.name]){
                        audioController[sound.name].gainNode.gain.value = sound.volume
                    }
                }
            }

            audioController.loaded = true
            audioController.sounds = soundBuffer.current.map(s => s.name)
    
            appContext.setAudioController(audioController) // we can now control the new audio from anywhere in our app
    
            return () => {
                context.current.close()
            }
        }

        if (props.sounds){
            init()
        }

    }, [props.sounds])


    return <></>
}