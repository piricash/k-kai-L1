using KakarikiKai.Application.Common;

namespace KakarikiKai.Infrastructure.Time;

public sealed class SystemClock : IClock
{
    public DateTimeOffset UtcNow => DateTimeOffset.UtcNow;
}
