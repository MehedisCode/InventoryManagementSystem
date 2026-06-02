using FluentValidation;
using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Company;

public class UpdateCompanySettingsCommand : IRequest<ApiResponse<bool>>
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public Guid CurrencyId { get; set; }
}

public class UpdateCompanySettingsCommandValidator
    : AbstractValidator<UpdateCompanySettingsCommand>
{
    public UpdateCompanySettingsCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.CurrencyId)
            .NotEmpty();
    }
}

public class UpdateCompanySettingsCommandHandler(
    IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateCompanySettingsCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(
        UpdateCompanySettingsCommand request,
        CancellationToken cancellationToken)
    {
        // Validate currency exists
        var currency = await unitOfWork.Currencies.GetByIdAsync(
            request.CurrencyId,
            cancellationToken);

        if (currency == null)
        {
            return ApiResponse<bool>.ErrorResponse(
                "Selected currency does not exist.");
        }

        var companyList = await unitOfWork.Company.GetAllAsync(cancellationToken);
        var company = companyList.FirstOrDefault();

        if (company == null)
        {
            company = new Domain.Entities.Company();

            await unitOfWork.Company.AddAsync(
                company,
                cancellationToken);
        }

        company.Name = request.Name;
        company.Email = request.Email;
        company.Phone = request.Phone;
        company.Address = request.Address;
        company.LogoUrl = request.LogoUrl;
        company.CurrencyId = request.CurrencyId;

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(
            true,
            "Company settings updated successfully.");
    }
}