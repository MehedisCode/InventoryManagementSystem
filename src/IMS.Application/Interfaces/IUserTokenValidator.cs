namespace IMS.Application.Interfaces;

public interface IUserTokenValidator
{
    Task<TokenValidationResult> ValidateAsync(string userId, CancellationToken cancellationToken);
}

public record TokenValidationResult(bool IsValid, string? Reason)
{
    public static TokenValidationResult Success() => new(true, null);
    public static TokenValidationResult Failure(string reason) => new(false, reason);
}
