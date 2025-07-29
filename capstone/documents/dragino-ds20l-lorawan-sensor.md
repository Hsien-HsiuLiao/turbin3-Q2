# DS20L LoRaWAN Smart Distance Detector

## Product Information
- **Product**: DS20L LoRaWAN Smart Distance Detector
- **Manufacturer**: Dragino
- **Product Page**: [DS20L Product Page](https://dragino.com/products/distance-level-sensor/item/289-ds20l.html)

## Setup and Configuration

### TTN (The Things Network) Connection
- **Quick Guide**: [How to connect to LoRaWAN server (OTAA)](https://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/DS20L_LoRaWAN_Smart_Distance_Detector_User_Manual/#H2.2200BQuickguidetoconnecttoLoRaWANserver28OTAA29)

### Data Decoders
- **TTN Decoder**: [DS20L v1.0 decoder for TTN](https://github.com/dragino/dragino-end-node-decoder/blob/main/DS20L/DS20L%20v1.0_decoder_TTN.txt)

## MeteoScientific Integration

### Documentation Resources
- **Tutorial Basics**: [Introduction to Console](https://www.meteoscientific.com/docs/tutorial-basics/intro-to-console)
- **Codec Documentation**: [Dragino LDDS75 Codec](https://www.meteoscientific.com/docs/codecs/codecs/dragino-ldds75)
- **Advanced Documentation**: [Tutorial Extras](https://www.meteoscientific.com/docs/tutorial-extras/documentation)

### MeteoScientific Console Features
The MeteoScientific Console uses a custom implemented version of Chirpstack maintained by Paul Pinault at Disk91.

**Key Features:**
- Custom Chirpstack implementation
- HTTP integration capabilities
- MQTT integration management
- API access for external applications

**Integration Capabilities:**
> "As you progress further into your MeteoScientific & Chirpstack journey, you'll want to start integrating outside apps so you can actually use your data."

### API Access
- **API Documentation**: [Chirpstack Community API Access](https://github.com/disk91/helium-chirpstack-community/wiki/API-Access)
- **Supported Protocols**: 
  - gRPC
  - REST-API
- **Standards**: Follows Chirpstack standards

## Additional Resources
- **Vanilla Chirpstack Documentation**: Available for reference on standard Chirpstack aspects
- **Custom Features**: MeteoScientific-specific implementations for HTTP, MQTT, and API integrations
