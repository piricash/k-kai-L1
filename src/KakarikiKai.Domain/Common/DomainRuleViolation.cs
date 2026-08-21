namespace KakarikiKai.Domain.Common;

public sealed class DomainRuleViolation(string message) : InvalidOperationException(message);
