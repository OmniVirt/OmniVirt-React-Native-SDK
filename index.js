import {StyleSheet, View, Platform} from 'react-native'
import React, {Component} from 'react'
import {WebView} from "omnivirt-react-native-webview"
import {rotation, setUpdateIntervalForType, SensorTypes} from "omnivirt-react-native-sensors"

export const Mode = {
  On: 'on',
  Off: 'off',
}
export const Feature = {
  Cardboard: 'cardboard',
  Gyroscope: 'gyroscope',
}
export const Quality = {
  Quality4K: 4,
  QualityFullHD: 3,
  QualityHD: 2,
  QualitySD: 1,
  QualityUnknown: 0,
}

const MIDDLEMAN_CONTENT = `
<!DOCTYPE html>
<html>
  <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style type="text/css">
          html, body { margin: 0; padding: 0; background: #000000; }
          iframe { border: none; width: 100%; height: 100%; position: fixed; left: 0; top: 0; }
      </style>
  </head>
  <body>
      <iframe id="ado-{CONTENTID}" src="about:blank" webkitAllowFullScreen="1" mozallowfullscreen="1" allowFullScreen="1"></iframe>
      <script type="text/javascript">
          var middleman = "{MIDDLEMAN}";
          if (middleman == "{MIDDLE" + "MAN}") middleman = "https://{CONTENT_URL}/content/{CONTENTID}?"
          else middleman = middleman + ((middleman.indexOf("?") != -1) ? "&" : "?") + "id={CONTENTID}&";
          document.getElementById("ado-{CONTENTID}").setAttribute("src", middleman + "player=true&experience&sdk=true&v=3&referer=%2A&host={SCRIPT_URL}");
      </script>
      <script type="text/javascript" src="https://{SCRIPT_URL}/scripts/vroptimal.js"></script>
      <script>
        window.ReactNativeWebView.postMessage('omnivirtbridge://initialize?null');
      </script>
  </body>
</html>
`
const EMPTY_CONTENT = `
<!DOCTYPE html>
<html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style type="text/css">
            html, body { margin: 0; padding: 0; background: #000000; }
            </style>
    </head>
    <body>
    </body>
</html>
`

const CONTENT_HOST = "www.vroptimal-3dx-assets.com"
const SCRIPT_HOST = "remote.vroptimal-3dx-assets.com"
const AD_HOST = "ads.omnivirt.com"

type Props = {}
export default class VRPlayer extends Component<Props> {
  constructor(props) {
    super(props)
    this.state = {
      contentHTML: EMPTY_CONTENT
    }
  }
  _contentID = 0
  _middleman = ""
  _hooked = false
  _isExpanded = false
  _sensorSubscription = null

  // --------------------------------------------------------------------------------------
  // Initialize
  // --------------------------------------------------------------------------------------

  load(contentID) {
    this.reset()
    this._contentID = contentID
    
    var content = MIDDLEMAN_CONTENT
    content = content.replace(/\{CONTENTID\}/g, this._contentID.toString())
    content = content.replace(/\{CONTENT_URL\}/g, CONTENT_HOST)
    content = content.replace(/\{SCRIPT_URL\}/g, SCRIPT_HOST)

    if (Platform.OS === 'android') {
      this.listenRotation()
    }

    this.setState({
      contentHTML: content
    })
  }

  loadAd(adSpaceID) {
    this.reset()
    this._contentID = Number.MAX_SAFE_INTEGER
    
    var content = MIDDLEMAN_CONTENT
    content = content.replace(/\{MIDDLEMAN\}/g, "https://" + AD_HOST + "/servead/" + adSpaceID.toString() + "?ad=true&slotID=ado-ad&forceExpandCollapse=false")
    content = content.replace(/\{CONTENTID\}/g, "ad")
    content = content.replace(/\{SCRIPT_URL\}/g, SCRIPT_HOST)
    
    if (Platform.OS === 'android') {
      this.listenRotation()
    }

    this.setState({
      contentHTML: content
    })
  }

  listenRotation() {
    setUpdateIntervalForType(SensorTypes.rotation, 200)

    this._sensorSubscription = rotation.subscribe(({alpha, beta, gamma, orientation}) => {
      if (this._hooked) {
        this.sendMessage('deviceorientation', {alpha: alpha, beta: beta, gamma: gamma, orientation: orientation})
      }
    })
  }

  unload() {
    this.reset()
    this.setState({
      contentID: 0,
      contentHTML: EMPTY_CONTENT
    })

    if (this._sensorSubscription != null) {
      this._sensorSubscription.unsubscribe()
      this._sensorSubscription = null
    }
  }

  // --------------------------------------------------------------------------------------
  // APIs
  // --------------------------------------------------------------------------------------

  // Don't reset these variables when calling reset()
  _cardboard = Mode.Off
  _interface = Mode.On
  _audio = 1.0
  _idle = Mode.off

  // Reset these variables when calling reset()
  _quality = null
  _duration = null
  _progress = null
  _buffer = null
  _seek = null
  _latitude = null
  _longitude = null

  sendMessage(command, data) {
    if (this._contentID == 0) {
        return
    }
    this.refs.webView.injectJavaScript(`
OmniVirt.api.sendMessage('${command}', ${JSON.stringify(data)}, document.getElementsByTagName('iframe')[0], true);
`)
  }

  receiveMessage(command) {
    this.refs.webView.injectJavaScript(`
OmniVirt.api.receiveMessage('${command}', function(command, data, iframe) {
    window.ReactNativeWebView.postMessage('omnivirtbridge://' + command + '?' + encodeURIComponent(JSON.stringify(data)))
  },
  document.getElementById('ado-${this._contentID}'));
`)
  }

  play() {
    this.sendMessage("play")
  }
    
  pause() {
    this.sendMessage("pause")
  }

  expand() {
    this.sendMessage("expand")
  }
  
  collapse() {
    this.sendMessage("collapse")
  }
  
  back() {
    this.sendMessage("back")
  }
  
  skip() {
    this.sendMessage("skip")
  }
  
  set cardboard(mode) {
    this.sendMessage("cardboard", mode)
  }
  get cardboard() {
    return this._cardboard
  }
  
  set audio(level) {
    this.sendMessage("audio", level)
  }
  get audio() {
    return this._audio
  }

  set quality(quality) {
    this.sendMessage("quality", quality)
  }
  get quality() {
    return this._quality
  }

  set interface(mode) {
    this.sendMessage("interface", mode)
  }
  get interface() {
    return this._interface
  }

  get duration() {
    return this._duration
  }

  get progress() {
    return this._progress
  }

  get buffer() {
    return this._buffer
  }

  set seek(value) {
    this.sendMessage("seek", value)
  }
  get seek() {
    return this._seek
  }

  set latitude(value) {
    this.sendMessage("latitude", value)
  }
  get latitude() {
    return this._latitude
  }

  set longitude(value) {
    this.sendMessage("longitude", value)
  }
  get longitude() {
    return this._longitude
  }

  set idle(mode) {
    this.setIdle(mode)
  }
  get idle() {
    return this._idle
  }
  
  setIdle(mode) {
    this._idle = mode
    if (mode == Mode.Off) {
      this.sendMessage("runscript", "MobileMonetizer.shouldRunEmptyLoop=false;")
    } else {
      this.sendMessage("runscript", "MobileMonetizer.shouldRunEmptyLoop=true;")
    }
  }
  
  enable(feature) {
    this.sendMessage("enable", feature)
  }
  
  disable(feature) {
    this.sendMessage("disable", feature)
  }
  
  switchScene(name) {
    this.sendMessage("switch", name)
  }

  // --------------------------------------------------------------------------------------
  // Events
  // --------------------------------------------------------------------------------------

  handleOnMessage(event) {
    let url = event.nativeEvent.data || ''
    let matched = url.match(/omnivirtbridge:\/\/(.*)\?(.*)/)

    if (matched != null) {
      let command = matched[1]
      let json = decodeURIComponent(matched[2])
      
      switch (command) {
        case "initialize":
          if (!this._hooked) {
            this.receiveMessage("loaded")
            this.receiveMessage("started")
            this.receiveMessage("paused")
            this.receiveMessage("ended")
            this.receiveMessage("skipped")
            this.receiveMessage("duration")
            this.receiveMessage("progress")
            this.receiveMessage("buffered")
            this.receiveMessage("seeked")
            this.receiveMessage("cardboard")
            this.receiveMessage("audio")
            this.receiveMessage("quality")
            this.receiveMessage("expanded")
            this.receiveMessage("collapsed")
            this.receiveMessage("latitude")
            this.receiveMessage("longitude")
            this.receiveMessage("switched")
            this.receiveMessage("fallbackExpand")
            this.receiveMessage("fallbackCollapse")
            this.sendMessage("interface", this._interface)
            this.sendMessage("cardboard", this._cardboard)
            this.sendMessage("audio", this._audio)
            this.setIdle(this._idle)
            this._hooked = true
          }
          break
        case "loaded":
          let dict = JSON.parse(json)
          if (dict["quality"] != null) {
            this._cardboard = dict["cardboard"]
            if (this.props.onLoaded) {
              this.props.onLoaded(this, dict["maxQuality"], dict["quality"], this._cardboard)
            }
          }
          break
        case "started":
          if (this.props.onStarted) {
            this.props.onStarted(this)
          }
          break
        case "paused":
          if (this.props.onPaused) {
            this.props.onPaused(this)
          }
          break
        case "ended":
          if (this.props.onEnded) {
            this.props.onEnded(this)
          }
          break
        case "skipped":
          if (this.props.onSkipped) {
            this.props.onSkipped(this)
          }
          break
        case "duration":
          this._duration = JSON.parse(json)
          if (this.props.onDurationChanged) {
            this.props.onDurationChanged(this, this._duration)
          }
          break
        case "progress":
          this._progress = JSON.parse(json)
          if (this.props.onProgressChanged) {
            this.props.onProgressChanged(this, this._progress)
          }
          break
        case "buffered":
          this._buffer = JSON.parse(json)
          if (this.props.onBufferChanged) {
            this.props.onBufferChanged(this, this._buffer)
          }
          break
        case "seeked":
          this._seek = JSON.parse(json)
          if (this.props.onSeekChanged) {
            this.props.onSeekChanged(this, this._seek)
          }
          break
        case "cardboard":
          this._cardboard = JSON.parse(json)
          if (this.props.onCardboardChanged) {
            this.props.onCardboardChanged(this, this._cardboard)
          }
          break
        case "audio":
          this._audio = JSON.parse(json)
          if (this.props.onVolumeChanged) {
            this.props.onVolumeChanged(this, this._audio)
          }
          break
        case "quality":
          this._quality = JSON.parse(json)
          if (this.props.onQualityChanged) {
            this.props.onQualityChanged(this, this._quality)
          }
          break
        case "fallbackExpand":
          if (!this._isExpanded) {
            this._isExpanded = true
            if (this.props.onExpanded) {
              this.props.onExpanded(this)
            }
          }
          break
        case "expanded":
          if (!this._isExpanded) {
            this._isExpanded = true
            if (this.props.onExpanded) {
              this.props.onExpanded(this)
            }
          }
          break
        case "fallbackCollapse":
          if (this._isExpanded) {
            this._isExpanded = false
            if (this.props.onCollapsed) {
              this.props.onCollapsed(this)
            }
          }
          break
        case "collapsed":
          if (this._isExpanded) {
            this._isExpanded = false
            if (this.props.onCollapsed) {
              this.props.onCollapsed(this)
            }
          }
          break
        case "latitude":
          this._latitude = JSON.parse(json)
          if (this.props.onLatitudeChanged) {
            this.props.onLatitudeChanged(this, this._latitude)
          }
          break
        case "longitude":
          this._longitude = JSON.parse(json)
          if (this.props.onLongitudeChanged) {
            this.props.onLongitudeChanged(this, this._longitude)
          }
          break
        case "switched":
          let data = JSON.parse(json)
          if (this.props.onSwitched) {
            this.props.onSwitched(this, data["scene"], data["history"])
          }
        default:
            break
      }
    }
  }

  handleOnShouldStartLoadWithRequest(action) {
    let url = action.url
    if (url.indexOf("http") == 0 &&
      !url.includes("vroptimal-3dx-assets") &&
      !url.toLowerCase().includes(this._middleman.toLowerCase()) &&
      !url.includes(".omnivirt.com/") &&
      !url.includes("googleapis.com") &&
      !url.includes("10.0.") &&
      !url.includes("192.168.")) {
      if (this.props.onOpenExternalURL) {
        this.props.onOpenExternalURL(url)
      }
      return false
    } else {
      return true
    }
  }
  
  // --------------------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------------------

  reset() {
    this._hooked = false
    this._middleman = ""

    this._quality = null
    this._duration = null
    this._progress = null
    this._buffer = null
    this._seek = null
    this._latitude = null
    this._longitude = null
  }

  render() {
    return (
      <WebView ref="webView"
          style={styles.content}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          onMessage={this.handleOnMessage.bind(this)}
          onShouldStartLoadWithRequest={this.handleOnShouldStartLoadWithRequest.bind(this)}
          mixedContentMode="compatibility"
          javaScriptEnabled={true}
          useWebKit={true}
          source={{html: this.state.contentHTML}}
        />
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#000000'
  },
})
