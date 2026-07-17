using NexusCRM.Web.DTOs.Companies;
using NexusCRM.Web.DTOs.Customers;
using NexusCRM.Web.Entities;
using NexusCRM.Web.Repositories.Interfaces;
using NexusCRM.Web.Services.Interfaces;

namespace NexusCRM.Web.Services.Implementations;

public class CompanyService(ICompanyRepository repository) : ICompanyService
{
    private readonly ICompanyRepository _repository = repository;

    public async Task<Result<bool>> AddAsync(CreateCompanyDto dto)
    {
        if (dto is null ||
            string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Length > 30 ||
            string.IsNullOrWhiteSpace(dto.Email) || dto.Email.Length > 30 ||
            string.IsNullOrWhiteSpace(dto.Industry) || dto.Industry.Length > 30 ||
            dto.Address is null)
            return Result<bool>.Fail("Invalid Company Data");

        if (await _repository.ExistsByEmailAsync(dto.Email))
            return Result<bool>.Fail("Company With This Email Already Exists");

        if (!string.IsNullOrWhiteSpace(dto.Phone) && await _repository.ExistsByPhoneAsync(dto.Phone))
            return Result<bool>.Fail("Company With This Phone Already Exists");

        var address = MapToAddress(dto.Address);

        if (await _repository.ExistsByNameAndAddressAsync(dto.Name, address))
            return Result<bool>.Fail("Company With This Name And Address Already Exists");

        var company = new Company
        {
            Name = dto.Name,
            Email = dto.Email,
            PhoneNumber = dto.Phone,
            Industry = dto.Industry,
            Address = address,
        };

        await _repository.AddAsync(company);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> UpdateAsync(int id, UpdateCompanyDto dto)
    {
        if (dto is null ||
            string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Length > 30 ||
            string.IsNullOrWhiteSpace(dto.Email) || dto.Email.Length > 30 ||
            string.IsNullOrWhiteSpace(dto.Industry) || dto.Industry.Length > 30 ||
            dto.Address is null)
            return Result<bool>.Fail("Invalid Company Data");

        var company = await _repository.GetByIdAsync(id);
        if (company is null)
            return Result<bool>.Fail("Company Not Found");

        company.Name = dto.Name;
        company.Email = dto.Email;
        company.PhoneNumber = dto.Phone;
        company.Industry = dto.Industry;
        company.Address = MapToAddress(dto.Address);

        _repository.Update(company);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> DeleteAsync(int id)
    {
        var company = await _repository.GetByIdAsync(id);
        if (company is null)
            return Result<bool>.Fail("Company Not Found");

        if (await _repository.HasCustomersAsync(id))
            return Result<bool>.Fail("Cannot Delete Company With Existing Customers");

        if (await _repository.HasDealsAsync(id))
            return Result<bool>.Fail("Cannot Delete Company With Existing Deals");

        if (await _repository.HasUsersAsync(id))
            return Result<bool>.Fail("Cannot Delete Company With Existing Users");

        await _repository.Delete(company);
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<List<CompanyDto>>> GetAllAsync()
    {
        var companies = await _repository.GetAllAsync();
        return Result<List<CompanyDto>>.Success(MapToDto(companies));
    }

    public async Task<Result<CompanyDto>> GetByIdAsync(int id)
    {
        var company = await _repository.GetByIdAsync(id);
        return company is null
            ? Result<CompanyDto>.Fail("Company Not Found")
            : Result<CompanyDto>.Success(MapToDto(company));
    }

    public async Task<Result<List<CompanyDto>>> GetActiveAsync()
    {
        var companies = await _repository.GetActiveAsync();
        return Result<List<CompanyDto>>.Success(MapToDto(companies));
    }

    public async Task<Result<List<CompanyDto>>> SearchAsync(string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return Result<List<CompanyDto>>.Fail("Invalid Search Keyword");

        var companies = await _repository.SearchAsync(keyword);
        return Result<List<CompanyDto>>.Success(MapToDto(companies));
    }

    public async Task<Result<CompanyDto>> GetByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result<CompanyDto>.Fail("Invalid Email");

        var company = await _repository.GetByEmailAsync(email);
        return company is null
            ? Result<CompanyDto>.Fail("Company Not Found")
            : Result<CompanyDto>.Success(MapToDto(company));
    }

    public async Task<Result<CompanyDto>> GetByPhoneAsync(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return Result<CompanyDto>.Fail("Invalid Phone");

        var company = await _repository.GetByPhoneAsync(phone);
        return company is null
            ? Result<CompanyDto>.Fail("Company Not Found")
            : Result<CompanyDto>.Success(MapToDto(company));
    }

    public async Task<Result<List<CompanyDto>>> GetByIndustryAsync(string industry)
    {
        if (string.IsNullOrWhiteSpace(industry))
            return Result<List<CompanyDto>>.Fail("Invalid Industry");

        var companies = await _repository.GetByIndustryAsync(industry);
        return Result<List<CompanyDto>>.Success(MapToDto(companies));
    }

    public async Task<Result<CompanyDto>> GetWithDetailsAsync(int id)
    {
        var company = await _repository.GetWithDetailsAsync(id);
        return company is null
            ? Result<CompanyDto>.Fail("Company Not Found")
            : Result<CompanyDto>.Success(MapToDto(company));
    }

    public async Task<Result<CompanyDto>> GetWithCustomersAsync(int id)
    {
        var company = await _repository.GetWithCustomersAsync(id);
        return company is null
            ? Result<CompanyDto>.Fail("Company Not Found")
            : Result<CompanyDto>.Success(MapToDto(company));
    }

    public async Task<Result<CompanyDto>> GetWithDealsAsync(int id)
    {
        var company = await _repository.GetWithDealsAsync(id);
        return company is null
            ? Result<CompanyDto>.Fail("Company Not Found")
            : Result<CompanyDto>.Success(MapToDto(company));
    }

    public async Task<Result<int>> GetCustomerCountAsync(int companyId)
    {
        var count = await _repository.GetCustomerCountAsync(companyId);
        return Result<int>.Success(count);
    }

    public async Task<Result<int>> GetDealCountAsync(int companyId)
    {
        var count = await _repository.GetDealCountAsync(companyId);
        return Result<int>.Success(count);
    }

    public async Task<Result<bool>> ActivateAsync(int id)
    {
        var company = await _repository.GetByIdAsync(id);
        if (company is null)
            return Result<bool>.Fail("Company Not Found");

        company.IsActive = true;
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<Result<bool>> DeactivateAsync(int id)
    {
        var company = await _repository.GetByIdAsync(id);
        if (company is null)
            return Result<bool>.Fail("Company Not Found");

        company.IsActive = false;
        await _repository.SaveAsync();

        return Result<bool>.Success();
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;
        return await _repository.ExistsByEmailAsync(email);
    }

    public async Task<bool> ExistsByPhoneAsync(string phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return false;
        return await _repository.ExistsByPhoneAsync(phone);
    }

    public List<CompanyDto> MapToDto(List<Company>? companyEntities)
    {
        if (companyEntities is null)
            return [];

        List<CompanyDto> companyDtos = new(companyEntities.Count);
        foreach (var company in companyEntities)
            companyDtos.Add(MapToDto(company));

        return companyDtos;
    }

    public CompanyDto MapToDto(Company companyEntity)
        => new()
        {
            Id = companyEntity.Id,
            Name = companyEntity.Name ?? string.Empty,
            Email = companyEntity.Email,
            Phone = companyEntity.PhoneNumber,
            Industry = companyEntity.Industry,
            IsActive = companyEntity.IsActive,
            FoundedDate = companyEntity.FoundedDate,
            Address = companyEntity.Address is null ? null : MapToAddressDto(companyEntity.Address),
        };

    private static Address MapToAddress(AddressDto dto)
        => new()
        {
            Country = dto.Country,
            Region = dto.Region,
            City = dto.City,
            Street = dto.Street,
            PostalCode = dto.PostalCode,
        };

    private static AddressDto MapToAddressDto(Address address)
        => new()
        {
            Country = address.Country ?? string.Empty,
            Region = address.Region,
            City = address.City ?? string.Empty,
            Street = address.Street,
            PostalCode = address.PostalCode,
        };
}
