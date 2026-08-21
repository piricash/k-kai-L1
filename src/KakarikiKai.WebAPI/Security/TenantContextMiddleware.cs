using KakarikiKai.Application.Common;

namespace KakarikiKai.WebAPI.Security;

public sealed class TenantContextMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context, ITenantContext tenantContext)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var orgCode = context.User.FindFirst("org_code")?.Value;
            if (string.IsNullOrWhiteSpace(orgCode))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new { code = "tenant_context_required", message = "An active Kinde organization is required." });
                return;
            }
            tenantContext.Set(orgCode);
        }
        try { await next(context); }
        finally { tenantContext.Clear(); }
    }
}
