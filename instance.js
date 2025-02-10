"use strict";
const SDK = globalThis.SDK;
{
  const PLUGIN_CLASS = SDK.Plugins.iDoveHelper_BiliOpen;

  PLUGIN_CLASS.Instance = class iDoveHelper_BiliOpenInstance extends SDK.IInstanceBase {
    constructor(sdkType, inst) {
      super(sdkType, inst);
    }
    Release() {}
    OnCreate() {}
    OnPropertyChanged(id, value) {}
    LoadC2Property(name, valueString) {
      return false; // not handled
    }
  };
}
