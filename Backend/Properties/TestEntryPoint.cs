using System.Diagnostics.CodeAnalysis;

namespace Backend;

// Marker class used as the type parameter for WebApplicationFactory in Backend.Tests.
[SuppressMessage("Performance", "CA1515:ConsiderMakingPublicTypesInternal",
    Justification = "Must be public so WebApplicationFactory<T> can use it as a type argument.")]
public sealed class TestEntryPoint { }
