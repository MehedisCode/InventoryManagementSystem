using IMS.Application.Common;
using MediatR;

namespace IMS.Application.Features.Auth.Login;

public class LoginCommand : IRequest<ApiResponse<LoginResponse>>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}