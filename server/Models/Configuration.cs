namespace Wayland.Models
{
    public class Configuration
    {
        public MongoDB MongoDB { get; set; }
    }

    public class MongoDB
    {
        public string Host { get; set; }
        public string User { get; set; }
        public string Password { get; set; }
        public int Port { get; set; }
        public string DatabaseName { get; set; }
    }
}