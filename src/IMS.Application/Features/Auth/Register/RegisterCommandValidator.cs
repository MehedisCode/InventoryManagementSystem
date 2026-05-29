using FluentValidation;

namespace IMS.Application.Features.Auth.Register; 

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(v => v.FullName)
            .NotEmpty().WithMessage("Full Name is required.");

        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Valid email is required.");

        RuleFor(v => v.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(v => v.RoleName)
            .NotEmpty().WithMessage("Role is required.");
    }
}