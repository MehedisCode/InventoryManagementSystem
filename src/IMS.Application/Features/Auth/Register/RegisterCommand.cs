using IMS.Application.Common;
using MediatR;

namespace IMS.Application.Features.Auth.Register;

public class RegisterCommand : IRequest<ApiResponse<string>>
{
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}
