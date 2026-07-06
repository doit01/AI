package com.demo.admin.config;

import de.codecentric.boot.admin.server.config.AdminServerProperties;
import jakarta.servlet.DispatcherType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final AdminServerProperties adminServer;

    public SecurityConfig(AdminServerProperties adminServer) {
        this.adminServer = adminServer;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        String contextPath = adminServer.getContextPath();

        http
            .securityMatcher(contextPath + "/**")
            .authorizeHttpRequests(auth -> auth
                .dispatcherTypeMatchers(DispatcherType.ASYNC).permitAll()
                .requestMatchers(contextPath + "/assets/**").permitAll()
                .requestMatchers(contextPath + "/login").permitAll()
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage(contextPath + "/login")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl(contextPath + "/logout")
            )
            .httpBasic(withDefaults())
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .ignoringRequestMatchers(req -> {
                    String path = req.getServletPath();
                    return path.equals(contextPath + "/instances")
                        || path.startsWith(contextPath + "/instances/");
                })
//                    CSRF（Cross-Site Request Forgery，跨站请求伪造）是一种攻击方式：你在银行网站已登录，然后访问了另一个恶意网站，这个恶意网站伪造一个转账请求发到银行服务器。浏览器会自动带上银行网站的 cookie，服务器以为是你的合法操作。
//                    CSRF token 是服务器生成的一段随机字符串，存在页面里。每次提交表单/发送请求时，必须带上这个 token（恶意网站拿不到）。服务器校验 token 匹配才放行，从而防止伪造请求。
//                    简单说：CSRF token 是服务器给浏览器发的一张"暗号"，暗号不对的操作全拒绝。
            )
            .rememberMe(remember -> remember
                .key("unique-remember-me-key")
                .tokenValiditySeconds(1209600)
            );
        return http.build();
    }
}
