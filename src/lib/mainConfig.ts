type MAINCONFIG_TYPE = {
    BASE_URL: "https://fastapi-service-v5-427230556695.asia-south2.run.app" | "http://localhost:3500" | "http://127.0.0.1:3500",
    ENVIORENMENT: "dev" | "prod"
}


export const mainConfig: MAINCONFIG_TYPE = {
    BASE_URL: `https://fastapi-service-v5-427230556695.asia-south2.run.app`,
    // BASE_URL: `http://127.0.0.1:3500`,
    // BASE_URL: `http://localhost:3500`,
    ENVIORENMENT: "dev"
} 
