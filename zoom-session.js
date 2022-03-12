const KJUR = require("jsrsasign");

function generateVideoToken(
  sdkKey,
  sdkSecret,
  topic = "",
  passWord = "",
  userIdentity = "",
  sessionKey = ""
) {
  let signature = "";
  try {
    const iat = Math.round(new Date().getTime() / 1000);
    const exp = iat + 60 * 60 * 2;

    // Header
    const oHeader = { alg: "HS256", typ: "JWT" };
    // Payload
    const oPayload = {
      app_key: sdkKey,
      iat,
      exp,
      tpc: topic,
      pwd: passWord,
      user_identity: userIdentity,
      session_key: sessionKey,
      // topic
    };
    // Sign JWT, password=616161
    const sHeader = JSON.stringify(oHeader);
    const sPayload = JSON.stringify(oPayload);
    signature = KJUR.jws.JWS.sign("HS256", sHeader, sPayload, sdkSecret);
  } catch (e) {
    console.error(e);
  }
  return signature;
}

module.exports = function (RED) {
  function ZoomSessionConfig(node) {
    RED.nodes.createNode(this, node);
    this.sdkKey = node.sdkKey;
    this.sdkSecret = node.sdkSecret;
    // this.topic = node.topic;
    // this.password = node.password;
  }

  RED.nodes.registerType("zoom-session-config", ZoomSessionConfig);

  function ZoomeSessionNode(config) {
    var node = this;
    RED.nodes.createNode(this, config);
    this.zoomSessionConfig = RED.nodes.getNode(config.zoomSessionConfig);

    if (this.zoomSessionConfig) {
      node.on("input", (msg) => {
        const signature = generateVideoToken(
          this.zoomSessionConfig.sdkKey,
          this.zoomSessionConfig.sdkSecret,
          "hello",
          "test",
          "username",
          "test"
        );

        msg.payload = {
          signature,
          topic: "hello",
        };

        node.send(msg);
      });
    } else {
      node.send({ payload: "No session configured" });
    }
  }

  RED.nodes.registerType("zoom-session", ZoomeSessionNode);
};
