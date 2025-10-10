class GeneralFunctions {

    private BASE_URL = "https://fastapi-service-v5-427230556695.asia-south2.run.app";
    // private BASE_URL = "https://fastapi-service-v4-427230556695.asia-south2.run.app";
    // private BASE_URL = "http://localhost:3500";
    createUrl(apiString: string): string {
        const url = `${this.BASE_URL}/${apiString}`;
        return url;
    }

    get baseUrl() {
        return this.BASE_URL
    }

    getUserId() :string | "" {
        return localStorage.getItem("userId") || "";
    }

    getUserName () : string | "" {
        return localStorage.getItem("name") || "User";
    }
}

export const generalFunctions = new GeneralFunctions();