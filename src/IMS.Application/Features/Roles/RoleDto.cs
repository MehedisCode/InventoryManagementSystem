namespace IMS.Application.Features.Roles;

public class RoleDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int UserCount { get; set; }
    public bool IsSystem { get; set; }
}
