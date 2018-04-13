import GlobalSetting from './GlobalSetting';
import axios from "axios";
import appSettings, { appSettings_$ } from "./AppSettings";
import { apiURL, GET_USER_LIST } from "./ApiRoutes";

export class GlobalUserLocales extends GlobalSetting {
    constructor() {
        super("globalUserLocales", {
            // default settings
            connectionName: "default",
            displayLocales: null,
            userLocaleList: [],
        }, {
            // false means throttled, true - immediate update, commented or null - no server update
            // userLocaleList: false,
        });

        this.connectionName = this.defaultSettings.connectionName;
        this.displayLocales = this.defaultSettings.displayLocales;

        this.unsubscribe = appSettings.subscribeLoaded(() => {
            if (appSettings_$.uiSettings() && appSettings_$.displayLocales[0]()) {
                if (this.connectionName !== appSettings_$.connectionName() ||
                    !this.displayLocales || this.displayLocales.join(',') !== appSettings_$.displayLocales.$_ifArray(Array.prototype.join, ',')) {
                    this.staleData(appSettings_$.uiSettings.autoUpdateViews());
                }
            }
        });

        this.load();
    }

    // implement to test if can request settings from server
    serverCanLoad() {
        return true;
    }

    // implement to request settings from server
    serverLoad() {
        axios.get(apiURL(GET_USER_LIST))
            .then((result) => {
                this.connectionName = result.data.connectionName;
                this.displayLocales = result.data.displayLocales;
                this.processServerUpdate(result.data);
            });
    }

    // implement to send server request
    updateServer(settings, frameId) {
        throw "globalUserLocales has no update";
    }
}

const globalUserLocales = new GlobalUserLocales();
export const globalUserLocales_$ = globalUserLocales.getBoxed();

export default globalUserLocales;

