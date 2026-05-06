run:
	dotnet build
	dotnet run --urls http://localhost:5119/

lint:
	dotnet format Backend.csproj --verify-no-changes --no-restore --severity warn

test:
	dotnet test ../Backend.Tests/Backend.Tests.csproj