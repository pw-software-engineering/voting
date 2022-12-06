FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["VotingApi.csproj", "."]
RUN dotnet restore "./VotingApi.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet publish "VotingApi.csproj" -c Release -o /app/publish --no-restore

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "VotingApi.dll"]