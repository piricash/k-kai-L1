using System.Security.Claims;
using KakarikiKai.Application.Common;
using KakarikiKai.Infrastructure.Tenancy;
using KakarikiKai.WebAPI.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;

namespace KakarikiKai.WebApi.Tests;

public sealed class SecurityBoundaryTests
{
    [Fact]
    public async Task KaiChef_permission_succeeds_when_the_Kinde_permissions_claim_contains_the_required_permission()
    {
        var requirement = new PermissionRequirement("kaiMenu:manage");
        var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim("permissions", "[\"kaiMenu:manage\",\"kaiBookings:view\"]")], "Kinde"));
        var context = new AuthorizationHandlerContext([requirement], principal, resource: null);

        await new PermissionAuthorizationHandler().HandleAsync(context);

        Assert.True(context.HasSucceeded);
    }

    [Fact]
    public async Task KaiChef_permission_denies_a_member_without_the_required_permission()
    {
        var requirement = new PermissionRequirement("kaiMenu:manage");
        var principal = new ClaimsPrincipal(new ClaimsIdentity([new Claim("permissions", "[\"kaiBookings:view\"]")], "Kinde"));
        var context = new AuthorizationHandlerContext([requirement], principal, resource: null);

        await new PermissionAuthorizationHandler().HandleAsync(context);

        Assert.False(context.HasSucceeded);
    }

    [Fact]
    public async Task Tenant_middleware_uses_only_the_trusted_organization_claim_and_clears_it_after_the_request()
    {
        var tenantContext = new TenantContext();
        string? observedTenant = null;
        var middleware = new TenantContextMiddleware(_ =>
        {
            observedTenant = tenantContext.TenantCode;
            return Task.CompletedTask;
        });
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity([new Claim("org_code", "org_kakariki")], "Kinde")),
        };

        await middleware.InvokeAsync(httpContext, tenantContext);

        Assert.Equal("org_kakariki", observedTenant);
        Assert.Null(tenantContext.TenantCode);
    }

    [Fact]
    public async Task Tenant_middleware_rejects_an_authenticated_request_that_has_no_organization_claim()
    {
        var tenantContext = new TenantContext();
        var nextCalled = false;
        var middleware = new TenantContextMiddleware(_ =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        });
        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.NameIdentifier, "kp_123")], "Kinde")),
        };

        await middleware.InvokeAsync(httpContext, tenantContext);

        Assert.Equal(StatusCodes.Status403Forbidden, httpContext.Response.StatusCode);
        Assert.False(nextCalled);
        Assert.Null(tenantContext.TenantCode);
    }
}
