using System.Runtime.CompilerServices;

[assembly: InternalsVisibleTo("Backend.Tests")]
// Required by NSubstitute (Castle.DynamicProxy) to mock internal interfaces at runtime.
[assembly: InternalsVisibleTo("DynamicProxyGenAssembly2")]
