using IMS.Application.Common;
using IMS.Application.Interfaces;
using MediatR;

namespace IMS.Application.Features.Currencies;

public class DeleteCurrencyCommand(Guid id) : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; } = id;
}

public class DeleteCurrencyCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteCurrencyCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(DeleteCurrencyCommand request, CancellationToken cancellationToken)
    {
        var currency = await unitOfWork.Currencies.GetByIdAsync(request.Id, cancellationToken);
        if (currency == null)
            return ApiResponse<bool>.ErrorResponse("Currency not found.");

        await unitOfWork.Currencies.DeleteAsync(currency, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.SuccessResponse(true, "Currency deleted successfully.");
    }
}
