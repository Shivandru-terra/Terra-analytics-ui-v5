import { mainConfig } from "./mainConfig";
class GeneralFunctions {
    createUrl(apiString: string): string {
        const url = `${mainConfig.BASE_URL}/${apiString}`;
        return url;
    }

    getUserId() :string {
        return localStorage.getItem("userId") || "";
    }
}

export const generalFunctions = new GeneralFunctions();