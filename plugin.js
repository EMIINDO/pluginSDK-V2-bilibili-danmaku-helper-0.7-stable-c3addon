//Converted with C2C3AddonConverter v1.0.0.15
"use strict"; 
 // Porting BY EMI INDO with c3addon-ide-plus
const SDK = globalThis.SDK;
{
  const PLUGIN_ID = "iDoveHelper_BiliOpen";
  // callMap Deprecated const PLUGIN_VERSION = "0.7.0.0";
  const PLUGIN_CATEGORY = "platform-specific";

  let app = null;

  const PLUGIN_CLASS = (SDK.Plugins.iDoveHelper_BiliOpen = class iDoveHelper_BiliOpen extends (
      SDK.IPluginBase
  ) {
    constructor() {
      super(PLUGIN_ID);
      SDK.Lang.PushContext("plugins." + PLUGIN_ID.toLowerCase());
      this._info.SetIcon("icon.png", "image/png");
      this._info.SetName(globalThis.lang(".name"));
      this._info.SetDescription(globalThis.lang(".description"));
      // callMap Deprecated this._info.SetVersion(PLUGIN_VERSION);
      this._info.SetCategory(PLUGIN_CATEGORY);
      this._info.SetAuthor("iDove");
      this._info.SetHelpUrl("https://helper.hz.idove.games:8/Document/");
      this._info.SetIsSingleGlobal(true);

      SDK.Lang.PushContext(".properties");
      // this._info.SetProperties([
      //   // new SDK.PluginProperty("integer", "testproperty", 0), // you should put own client id
      // ]);
      SDK.Lang.PopContext(); // .properties
      SDK.Lang.PopContext();
    }
  });
  PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS);
}
