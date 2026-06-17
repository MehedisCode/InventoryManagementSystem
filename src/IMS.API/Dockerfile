# syntax=docker/dockerfile:1.7

# build React app
FROM node:22-alpine AS web-build
WORKDIR /web
COPY src/IMS.Web/package*.json ./
RUN npm ci --no-audit --no-fund
COPY src/IMS.Web ./
RUN npm run build

# build API
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src
COPY InventoryManagementSystem.slnx ./
COPY src/IMS.API/IMS.API.csproj                       src/IMS.API/
COPY src/IMS.Application/IMS.Application.csproj       src/IMS.Application/
COPY src/IMS.Domain/IMS.Domain.csproj                 src/IMS.Domain/
COPY src/IMS.Infrastructure/IMS.Infrastructure.csproj src/IMS.Infrastructure/
RUN dotnet restore InventoryManagementSystem.slnx
COPY src/ ./src/
RUN dotnet publish src/IMS.API/IMS.API.csproj -c Release -o /app/publish --no-restore /p:UseAppHost=false

# run API
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
USER app
COPY --from=api-build --chown=app:app /app/publish ./
COPY --from=web-build --chown=app:app /web/dist ./wwwroot
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=true
ENTRYPOINT ["dotnet", "IMS.API.dll"]
HEALTHCHECK --interval=10s --timeout=5s --retries=10 --start-period=60s \
  CMD bash -c 'exec 3<>/dev/tcp/127.0.0.1/8080' || exit 1
