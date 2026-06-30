using System.Diagnostics.CodeAnalysis;

namespace Backend;

// Clase marcadora usada como parámetro de tipo para WebApplicationFactory en Backend.Tests.
[SuppressMessage("Performance", "CA1515:ConsiderMakingPublicTypesInternal",
    Justification = "Must be public so WebApplicationFactory<T> can use it as a type argument.")]
public sealed class TestEntryPoint { }
