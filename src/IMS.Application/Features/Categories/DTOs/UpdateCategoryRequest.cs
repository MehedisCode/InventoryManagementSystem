namespace IMS.Application.Features.Categories.DTOs;

public record UpdateCategoryRequest(
    string Name,
    string Description
);