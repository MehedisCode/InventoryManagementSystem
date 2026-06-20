namespace IMS.Domain.Constants;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Manager = "Manager";
    public const string Staff = "Staff";
    public static readonly IReadOnlyList<string> All = [Admin, Manager, Staff];
    public static readonly IReadOnlyList<string> System = All;
}

public static class RolesExtensions
{
    public static bool IsSystemRole(this string? name) =>
        name is Roles.Admin or Roles.Manager or Roles.Staff;
}
