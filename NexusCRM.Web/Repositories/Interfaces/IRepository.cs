namespace NexusCRM.Web.Repositories.Interfaces;

public interface IRepository<T>
{
    Task<ICollection<T>> GetAllAsync();

    Task<T?> GetByIdAsync(int id);
    Task AddAsync (T entity);

    Task Delete(T entity);

    Task Update(T entity);

    Task SaveAsync();

    // TODO: Adding pagination | Task<List<T>> GetPagedAsync(int page, int pageSize);
}
