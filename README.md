# 360° VR Player and Monetization for React Native Developers

**OmniVirt VR Player** makes the leading player for 360° video experiences across mobile and desktop. Upload your 360° content to OmniVirt and serve it into your app with few easy steps.

**OmniVirt Ad Network** provides you an advertising platform enables developers and publishers to monetize their apps with engaging VR content in seamless user experience way.

Simply integrate the OmniVirt SDK into your iOS, Android or Web application and get paid for presenting sponsored 360° video experiences to your users. Backfill your inventory with premium CPM experiences from OmniVirt’s network of advertisers. We support both 360° and 2D video ads inside VR apps.

Contact us for more info at [contact@omnivirt.com](mailto:contact@omnivirt.com).
Visit [www.omnivirt.com](https://www.omnivirt.com/) to upload content or create ad space.

# Example Apps

- [OmniVirt VR Player for React Native](https://github.com/OmniVirt/OmniVirt-React-Native-Example)

## Installation SDK

### Install OmniVirt SDK
```bash
$ yarn add omnivirt-react-native-sdk --save

$ react-native link omnivirt-react-native-sensors
$ react-native link omnivirt-react-native-webview
```
### Import VRPlayer
```javascript
import {VRPlayer, Feature, Mode, Quality} from "omnivirt-react-native-sdk"
```
### Add VRPlayer
```javascript
<VRPlayer ref="vrPlayer" />
```
### Load Content
Please add the following code in componentDidMount():
```javascript
this.refs.vrPlayer.load(CONTENT_ID)
```
Please also change the CONTENT_ID into your creative id, for example: 24.

### Listen to Expand And Collapse Events
```javascript
<VRPlayer ref="vrPlayer"
          onExpanded={this.handleOnExpanded.bind(this)}
          onCollapsed={this.handleOnCollapsed.bind(this)} />
```
Adding the following into your component:
```javascript
handleOnExpanded(player) {
  this.setState({
    isPlayerInFullscreenMode: true
  })
}
handleOnCollapsed(player) {
  this.setState({
    isPlayerInFullscreenMode: false
  })
}
```
Please manage expand and collapse layout by yourself.

## Player Action
```
play()
pause()
expand()
collapse()
back()
skip()
cardboard { get; set }
audio { get; set }
quality { get; set }
interface { get; set }
duration { get; }
progress { get; }
buffer { get; }
seek { get; set }
latitude { get; set }
longitude { get; set }
idle { get; set }
enable(feature)
disable(feature)
switchScene(name)
sendMessage(command, data)
receiveMessage(command)
```

## Player Events
```
onLoaded={(player: Object, maximumQuality: Quality, currentQuality: Quality, currentCardboardMode: Mode) => {}}
onStarted={(player: Object) => {}}
onPaused={(player: Object) => {}}
onEnded={(player: Object) => {}}
onSkipped={(player: Object) => {}}
onDurationChanged={(player: Object, value: Double) => { /* 0.0 to 1.0 */ }}
onProgressChanged={(player: Object, value: Double) => { /* 0.0 to 1.0 */ }}
onBufferChanged={(player: Object, value: Double) => { /* 0.0 to 1.0 */ }}
onSeekChanged={(player: Object, value: Double) => { /* 0.0 to 1.0 */ }}
onCardboardChanged={(player: Object, mode: Mode) => {}}
onVolumeChanged={(player: Object, value: Double) => { /*0.0 to 1.0*/ }}
onQualityChanged={(player: Object, quality: Quality) => {}}
onExpanded={(player: Object) => {}}
onCollapsed={(player: Object) => {}}
onLatitudeChanged={(player: Object, value: Double) => { /* -90 to 90 */ }}
onLongitudeChanged={(player: Object, value: Double) => { /* 0 to 360 */ }}
onSwitched={(player: Object, sceneName: String, historyStack: [String]) => {}}
```

# Questions?

Please email us at [contact@omnivirt.com](mailto:contact@omnivirt.com)
