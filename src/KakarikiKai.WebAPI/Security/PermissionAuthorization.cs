using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace KakarikiKai.WebAPI.Security;

public sealed record PermissionRequirement(string Permission) : IAuthorizationRequirement;

public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User.FindAll("permissions").SelectMany(claim => ExpandClaim(claim.Value)).Contains(requirement.Permission, StringComparer.Ordinal)) context.Succeed(requirement);
        return Task.CompletedTask;
    }

    private static IEnumerable<string> ExpandClaim(string value)
    {
        if (!value.StartsWith("[", StringComparison.Ordinal)) return [value];
        try { return JsonSerializer.Deserialize<string[]>(value) ?? []; }
        catch (JsonException) { return []; }
    }
}
