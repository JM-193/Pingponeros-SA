run:
	dotnet build
	dotnet run --urls http://localhost:5119/

lint:
	dotnet format Backend.csproj --verify-no-changes --no-restore --severity warn

test:
	dotnet test ../Backend.Tests/Backend.Tests.csproj --collect:"XPlat Code Coverage" --settings ../Backend.Tests/coverage.runsettings

coverage: test
	dotnet tool run reportgenerator \
		-reports:"../Backend.Tests/TestResults/**/coverage.cobertura.xml" \
		-targetdir:"../Backend.Tests/TestResults/CoverageReport" \
		-reporttypes:"Html;HtmlSummary" \
		-assemblyfilters:"-*.Tests"
	@echo "Report generated: Backend.Tests/TestResults/CoverageReport/index.html"

report: coverage
	xdg-open ../Backend.Tests/TestResults/CoverageReport/index.html