using FluentValidation;
using DesafioCCAA.Business.DTOs;

namespace DesafioCCAA.Business.Validators;

public class CreateBookDtoValidator : AbstractValidator<CreateBookDto>
{
    public CreateBookDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Título é obrigatório")
            .Length(1, 200).WithMessage("Título deve ter entre 1 e 200 caracteres");

        RuleFor(x => x.ISBN)
            .NotEmpty().WithMessage("ISBN é obrigatório")
            .Length(10, 13).WithMessage("ISBN deve ter entre 10 e 13 caracteres")
            .Matches(@"^[0-9\-X]+$").WithMessage("ISBN deve conter apenas números, hífens e X");

        RuleFor(x => x.Author)
            .NotEmpty().WithMessage("Autor é obrigatório")
            .Length(1, 100).WithMessage("Autor deve ter entre 1 e 100 caracteres");

        RuleFor(x => x.Synopsis)
            .NotEmpty().WithMessage("Sinopse é obrigatória")
            .MaximumLength(5000).WithMessage("Sinopse deve ter no máximo 5000 caracteres");
    }
}
